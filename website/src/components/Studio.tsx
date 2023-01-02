import { utils } from 'publicodes'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import Documentation from './Documentation'
import ErrorBoundary from './ErrorBoundary'
import styles from './studio.module.css'

const { decodeRuleName } = utils

const EXAMPLE_CODE = `
# Bienvenue dans le bac à sable du langage publicode !
# Pour en savoir plus sur le langage :
# => https://publi.codes/docs/principes-de-base

prix:
  avec:
    carottes: 2€/kg
    champignons: 5€/kg
    avocat: 2€/avocat

dépenses primeur:
  somme:
    - prix . carottes * 1.5 kg
    - prix . champignons * 500g
    - prix . avocat * 3 avocat
`

export default function Studio() {
	const { search, pathname, hash } = useLocation()
	const searchParams = new URLSearchParams(search ?? '')
	const initialValue = useMemo(() => {
		const code = searchParams.get('code')
		const hashCode = hash && unescape(decodeURIComponent(hash))
		return code || hashCode || EXAMPLE_CODE
	}, [hash, search])
	const [editorValue, setEditorValue] = useState(initialValue)
	const debouncedEditorValue = useDebounce(editorValue, 1000)

	const history = useHistory()
	useEffect(() => {
		history.replace({
			pathname,
			hash: encodeURIComponent(debouncedEditorValue),
		})
	}, [debouncedEditorValue, history])

	const handleShare = useCallback(() => {
		window?.navigator.clipboard.writeText(window.location.href)
	}, [window.location.href])

	const { target } = useParams<{ target?: string }>()
	const defaultTarget = target && decodeRuleName(target)

	return (
		<div className={styles.studio}>
			<div>
				<MonacoEditor
					language="yaml"
					height="75vh"
					defaultValue={editorValue}
					onChange={(newValue) => setEditorValue(newValue ?? '')}
					options={{
						minimap: { enabled: false },
						automaticLayout: true,
					}}
				/>
			</div>

			<section>
				<ErrorBoundary key={debouncedEditorValue}>
					{/* TODO: prévoir de changer la signature de EngineProvider */}

					<Documentation
						rules={debouncedEditorValue}
						onClickShare={handleShare}
						defaultTarget={defaultTarget}
						baseUrl="/studio"
					/>
				</ErrorBoundary>
			</section>
		</div>
	)
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
