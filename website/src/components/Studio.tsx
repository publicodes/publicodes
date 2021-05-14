import Engine from 'publicodes'
import { RulePage, getDocumentationSiteMap } from 'publicodes-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import { invertObj, last } from 'ramda'
import { useHistory, useLocation, Link } from 'react-router-dom'
import Head from '@docusaurus/Head'
import styles from './studio.module.css'

const EXAMPLE_CODE = `
# Bienvenue dans le bac à sable du langage publicode !
# Pour en savoir plus sur le langage :
# => https://publi.codes/documentation/principes-de-base

prix:
prix . carottes: 2€/kg
prix . champignons: 5€/kg
prix . avocat: 2€/avocat

dépenses primeur:
  formule:
    somme:
      - prix . carottes * 1.5 kg
      - prix . champignons * 500g
      - prix . avocat * 3 avocat
`

export default function Studio() {
	const { search, pathname } = useLocation()
	const searchParams = new URLSearchParams(search ?? '')
	const initialValue = useMemo(() => {
		const code = searchParams.get('code')
		return code ? code : EXAMPLE_CODE
	}, [search])
	const [editorValue, setEditorValue] = useState(initialValue)
	const debouncedEditorValue = useDebounce(editorValue, 1000)

	const history = useHistory()
	useEffect(() => {
		searchParams.set('code', debouncedEditorValue)
		history.replace({
			pathname,
			search: '?' + searchParams.toString(),
		})
	}, [debouncedEditorValue, history])

	const handleShare = useCallback(() => {
		window?.navigator.clipboard.writeText(window.location.href)
	}, [window.location.href])

	return (
		<>
			<div className={styles.studio}>
				<MonacoEditor
					language="yaml"
					height="90vh"
					defaultValue={editorValue}
					onChange={(newValue) => setEditorValue(newValue ?? '')}
					options={{
						minimap: { enabled: false },
					}}
				/>
				<section className="result-pane">
					<ErrorBoundary key={debouncedEditorValue}>
						{/* TODO: prévoir de changer la signature de EngineProvider */}

						<Results rules={debouncedEditorValue} onClickShare={handleShare} />
					</ErrorBoundary>
				</section>
			</div>
		</>
	)
}

type ResultsProps = {
	rules: string
	onClickShare: React.MouseEventHandler
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
				css={`
					background: lightyellow;
					padding: 20px;
					border-radius: 5px;
				`}
				key={m}
			>
				{nl2br(m)}
			</div>
		))
	}
}

export const Results = ({ onClickShare, rules }: ResultsProps) => {
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
		<>
			{logger.toJSX()}
			<div
				css={`
					display: flex;
					justify-content: space-between;
					align-items: baseline;
				`}
			>
				<small>
					Aller à{' '}
					<select
						onChange={(e) => {
							setCurrentTarget(e.currentTarget.value ?? '')
						}}
						value={currentTarget}
						css={`
							font-size: inherit;
							color: inherit;
							font-family: inherit;
						`}
					>
						{targets.map((target) => (
							<option key={target} value={target}>
								{target}
							</option>
						))}
					</select>
				</small>
				<button onClick={onClickShare}>🔗 Copier le lien</button>
			</div>
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
		</>
	)
}

const newlineRegex = /(\r\n|\r|\n)/g

function nl2br(str: string) {
	if (typeof str !== 'string') {
		return str
	}

	return str.split(newlineRegex).map(function (line, index) {
		if (line.match(newlineRegex)) {
			return React.createElement('br', { key: index })
		}
		return line
	})
}

class ErrorBoundary extends React.Component {
	state: { error: false | { message: string; name: string } } = { error: false }

	static getDerivedStateFromError(error: Error) {
		console.error(error)
		return { error: { message: error.message, name: error.name } }
	}
	render() {
		if (this.state.error) {
			return (
				<div
					css={`
						background: lightyellow;
						padding: 20px;
						border-radius: 5px;
					`}
				>
					<strong>{this.state.error.name}</strong>
					<br />
					{nl2br(this.state.error.message)}
					<br />
					<br />
					<a onClick={() => window.location.reload()}>Rafraichir</a>
				</div>
			)
		}
		return this.props.children
	}
}

function useDebounce<T>(value: T, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value)
	useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				setDebouncedValue(value)
			}, delay)

			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler)
			}
		},
		[value, delay] // Only re-call effect if value or delay changes
	)
	return debouncedValue
}
