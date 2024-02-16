import Head from '@docusaurus/Head'
import { getDocumentationSiteMap, RulePage } from '@publicodes/react-ui'
import Engine, { utils } from 'publicodes'
import { invertObj, last } from 'ramda'
import React, {
	ComponentProps,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import ErrorBoundary, { nl2br } from './ErrorBoundary'

// this is a heavy library, this component shoudl be lazy loaded
import { parse } from 'yaml'

type ResultsProps = {
	rules: string
	onClickShare?: React.MouseEventHandler
	defaultTarget?: string
	onTargetChange?: (target: string) => void
	baseUrl?: string
	showDevSection?: boolean
}

class Logger {
	messages: string[] = []
	warn(message: string) {
		this.messages.push(message)
	}
	error(message: string) {
		this.messages.push(message)
	}
	log(message: string) {
		this.messages.push(message)
	}
	toJSX() {
		return this.messages.map((m) => (
			<div
				style={{
					background: 'lightyellow',
					padding: 20,
					borderRadius: 5,
				}}
				key={m}
			>
				{nl2br(m)}
			</div>
		))
	}
}

export default function Documentation({
	onClickShare,
	rules,
	defaultTarget = '',
	onTargetChange,
	baseUrl,
	showDevSection,
}: ResultsProps) {
	const logger = useMemo(() => new Logger(), [rules])
	const engine = useMemo(
		() => new Engine(parse(rules), { logger }),
		[rules, logger],
	)
	const targets = useMemo(() => Object.keys(engine.getParsedRules()), [engine])
	const pathToRules = useMemo(
		() => getDocumentationSiteMap({ engine, documentationPath: '' }),
		[engine],
	)
	const ruleToPaths = useMemo(() => invertObj(pathToRules), [pathToRules])
	const { search, pathname } = useLocation()
	const searchParams = new URLSearchParams(search ?? '')
	const history = useHistory()
	const [currentTarget, setTarget] = useState(
		searchParams.get('rule') || defaultTarget,
	)
	const [currentSearch, setSearch] = useState(search)
	const setCurrentTarget = useCallback(
		(target, search = undefined) => {
			onTargetChange?.(target)
			setTarget(target)
			if (search !== undefined) {
				setSearch(search)
			}
		},
		[onTargetChange],
	)

	useEffect(() => {
		if (!targets.includes(currentTarget)) {
			setCurrentTarget(last(targets) ?? '')
		}
	}, [currentTarget])

	useEffect(() => {
		if (baseUrl == null) {
			return
		}
		const newPathname =
			baseUrl +
			'/' +
			utils.encodeRuleName(currentTarget) +
			(currentSearch ?? '')

		if (pathname !== newPathname) {
			history.replace({
				...history.location,
				pathname: newPathname,
			})
		}
	}, [baseUrl, currentTarget, currentSearch, pathname, history])

	return (
		<div style={{ padding: '1rem' }}>
			{logger.toJSX()}

			<ErrorBoundary>
				<RulePage
					language={'fr'}
					rulePath={ruleToPaths[currentTarget]?.replace(/^\//, '') || ''}
					engine={engine}
					documentationPath={''}
					showDevSection={showDevSection}
					renderers={{
						Link: ({
							to,
							children,
						}: {
							to?: ComponentProps<typeof Link>['to']
							children: React.ReactNode
						}) => {
							return (
								<Link
									to={to}
									onClick={(evt) => {
										evt.preventDefault()
										evt.stopPropagation()
										const { pathname, search } = evt.currentTarget
										setCurrentTarget(pathToRules[decodeURI(pathname)], search)
									}}
								>
									{children}
								</Link>
							)
						},
						Head,
					}}
				/>
			</ErrorBoundary>

			{onClickShare && (
				<button
					style={{ margin: '1rem auto', display: 'block' }}
					onClick={onClickShare}
				>
					🔗 Copier le lien de la page
				</button>
			)}
		</div>
	)
}
