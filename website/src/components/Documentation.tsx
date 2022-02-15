import Head from '@docusaurus/Head'
import Engine from 'publicodes'
import { getDocumentationSiteMap, RulePage } from 'publicodes-react'
import { invertObj, last } from 'ramda'
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import ErrorBoundary, { nl2br } from './ErrorBoundary'

type ResultsProps = {
	rules: string
	onClickShare?: React.MouseEventHandler
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

export default function Documentation({ onClickShare, rules }: ResultsProps) {
	const logger = useMemo(() => new Logger(), [rules])
	const engine = useMemo(() => new Engine(rules, { logger }), [rules, logger])
	const targets = useMemo(() => Object.keys(engine.getParsedRules()), [engine])
	const pathToRules = useMemo(
		() => getDocumentationSiteMap({ engine, documentationPath: '' }),
		[engine]
	)
	const ruleToPaths = useMemo(() => invertObj(pathToRules), [pathToRules])
	const { search, pathname } = useLocation()
	const searchParams = new URLSearchParams(search ?? '')
	const history = useHistory()
	const [currentTarget, setCurrentTarget] = useState(
		searchParams.get('rule') || ''
	)
	useEffect(() => {
		if (!targets.includes(currentTarget)) {
			setCurrentTarget(last(targets) ?? '')
		}
	}, [currentTarget])

	useEffect(() => {
		if (searchParams.get('rule') !== currentTarget) {
			searchParams.set('rule', currentTarget)
			// TODO : remettre la synchronisation avec l'URL
			// history.replace({
			// 	pathname,
			// 	search: '?' + searchParams.toString(),
			// })
		}
	}, [searchParams, currentTarget])

	return (
		<div style={{ padding: '0 1rem' }}>
			{logger.toJSX()}
			<p>
				<small>
					Aller à{' '}
					<select
						onChange={(e) => {
							setCurrentTarget(e.currentTarget.value ?? '')
						}}
						value={currentTarget}
						style={{
							fontSize: 'inherit',
							color: 'inherit',
							fontFamily: 'inherit',
							maxWidth: '300px',
						}}
					>
						{targets.map((target) => (
							<option key={target} value={target}>
								{target}
							</option>
						))}
					</select>
				</small>{' '}
				{onClickShare && (
					<button onClick={onClickShare}>🔗 Copier le lien</button>
				)}
			</p>
			<ErrorBoundary>
				<RulePage
					language={'fr'}
					rulePath={ruleToPaths[currentTarget]?.replace(/^\//, '') || ''}
					engine={engine}
					documentationPath={''}
					renderers={{
						Link: ({ to, children }) => {
							return (
								<Link
									to={to}
									onClick={(evt) => {
										evt.preventDefault()
										evt.stopPropagation()
										setCurrentTarget(pathToRules[to])
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
		</div>
	)
}
