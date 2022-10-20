import { utils } from 'publicodes'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import Documentation from './Documentation'
import ErrorBoundary from './ErrorBoundary'
import styles from './studio.module.css'
import useYjs from './share/useYjs'
import * as Y from 'yjs'
import { MonacoBinding } from 'y-monaco'
import { generateRoomName } from './share/studioShareUtils'

const { decodeRuleName } = utils

const EXAMPLE_CODE = `
# Bienvenue dans le bac à sable du langage publicode !
# Pour en savoir plus sur le langage :
# => https://publi.codes/documentation/principes-de-base

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
	const { search, pathname } = useLocation()
	const searchParams = new URLSearchParams(search ?? '')
	const initialValue = useMemo(() => {
		const code = searchParams.get('code')
		return code ? code : EXAMPLE_CODE
	}, [search])
	const location = useLocation()
	const [name, setName] = useState(
		location.pathname.split('/').at(-1) || generateRoomName()
	)
	const [share, setShare] = useState()
	const [editorValue, setEditorValue] = useState(name ? '' : initialValue)
	const debouncedEditorValue = useDebounce(editorValue, 1000)

	const urlFragment = encodeURIComponent(name)

	const history = useHistory()
	const yjs = useYjs(urlFragment, 'p2p', share, setShare)

	useEffect(() => {
		if (urlFragment.length > 2) history.replace('/studio/' + urlFragment)
		//TODO refresh on first replace, to avoid
	}, [urlFragment])

	const handleShare = useCallback(() => {
		window?.navigator.clipboard.writeText(window.location.href)
	}, [window.location.href])

	const { target } = useParams<{ target?: string }>()
	const defaultTarget = target && decodeRuleName(target)
	console.log(share, yjs)

	return (
		<div className={styles.studio}>
			<div>
				<input
					type="string"
					style={{ width: '16rem' }}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Le nom de votre document"
				/>

				<button onClick={() => setName(generateRoomName())}>
					♻️ Générer un autre nom
				</button>

				{share && share.ydoc.getText('monacoCode') && yjs.username && (
					<MonacoEditor
						language="yaml"
						height="75vh"
						defaultValue={editorValue}
						onChange={(newValue) => setEditorValue(newValue ?? '')}
						options={{
							minimap: { enabled: false },
							automaticLayout: true,
						}}
						editorDidMount={(editor, monaco) => {
							const monacoBinding = new MonacoBinding(
								share.ydoc.getText('monacoCode'),
								/** @type {monaco.editor.ITextModel} */ editor.getModel(),
								new Set([editor]),
								share.provider.awareness
							)
						}}
					/>
				)}
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
