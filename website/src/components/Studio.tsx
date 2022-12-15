import { utils } from 'publicodes'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import Documentation from './Documentation'
import ErrorBoundary from './ErrorBoundary'
import styles from './studio.module.css'
import useYjs from './share/useYjs'
import * as Y from 'yjs'
import { MonacoBinding } from 'y-monaco'
import { generateRoomName } from './share/studioShareUtils'
import useLocalStorageState from 'use-local-storage-state'
import Editor from '@monaco-editor/react'
import { UserBlock } from './share/UserList'

const { decodeRuleName } = utils

const EXAMPLE_CODE = `
# Bienvenue dans le bac à sable publicodes !
# ⚠️ Le bac à sable est utile pour expérimenter, mais : 
# - fiabilité: assurez-vous rapidement que votre code soit stocké de façon sécurisé ailleurs, par exemple sur un dépôt Github
# - sécurité: ne l'utilisez pas pour du code secret
#
# Pour en savoir plus sur le langage :
# => https://publi.codes/docs/principes-de-base
#

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
	const [layout, setLayout] = useState('split')
	const { search, pathname } = useLocation()
	const searchParams = new URLSearchParams(search ?? '')
	const location = useLocation()
	const [name, setName] = useState(
		location.pathname.split('/studio/')[1] || generateRoomName()
	)
	const [share, setShare] = useState()
	const [editorValue, setEditorValue] = useState(EXAMPLE_CODE)

	const debouncedEditorValue = useDebounce(editorValue, 100)

	const urlFragment = encodeURIComponent(name)

	const history = useHistory()

	const yjs = useYjs(urlFragment, 'database', share, setShare)

	useEffect(() => {
		if (urlFragment.length > 2) history.replace('/studio/' + urlFragment)
		//TODO refresh on first replace, to avoid
	}, [urlFragment])

	const handleShare = useCallback(() => {
		window?.navigator.clipboard.writeText(window.location.href)
	}, [window.location.href])

	const { target } = useParams<{ target?: string }>()
	const defaultTarget = target && decodeRuleName(target)
	const monacoCode = share && share.ydoc.getText('monacoCode')

	const handleEditorDidMount = (editor, monaco) => {
		// here is the editor instance
		// you can store it in `useRef` for further usage
		const monacoBinding = new MonacoBinding(
			monacoCode,
			editor.getModel(),
			new Set([editor]),
			share.provider.awareness
		)
	}

	// This is for local persistence. TODO is it really needed ?
	useEffect(() => {
		share &&
			share.persistence &&
			share.persistence.once('synced', () => {
				console.log('initial content from the local browser database loaded')
			})
	}, [yjs])

	useEffect(() => {
		share &&
			share.provider &&
			share.provider.once('synced', () => {
				console.log('initial content from the online database loaded')
				console.log('Plog', monacoCode.toString())
				if (monacoCode.toString() === '') monacoCode.insert(0, EXAMPLE_CODE)
			})
	}, [yjs, monacoCode])

	useEffect(() => {
		console.log('SALU', monacoCode?.toString())
	}, [monacoCode])

	const layoutModes = { code: 'Code', split: 'Partagé', view: 'Documentation' }
	return (
		<div className={styles.studio}>
			<ul id="layoutButtons">
				{Object.entries(layoutModes).map(([key, value]) => (
					<li onClick={() => setLayout(key)}>
						<button className="button button--sm button--secondary">
							{value}
						</button>
					</li>
				))}
			</ul>
			<div>
				<section
					style={
						{
							split: { width: '50%' },
							view: { display: 'none' },
							code: { width: '100%' },
						}[layout]
					}
				>
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
					</div>
					<div>
						{yjs && (
							<UserBlock
								{...{ users: yjs.users, username: yjs.username, room: name }}
							/>
						)}
					</div>

					{share && (
						<Editor
							height="75vh"
							defaultLanguage="yaml"
							defaultValue={editorValue}
							onChange={(newValue) =>
								console.log('setFromMonaco', newValue) ||
								setEditorValue(newValue ?? '')
							}
							onMount={handleEditorDidMount}
						/>
					)}
				</section>
				<section
					style={
						{
							split: { width: '50%' },
							code: { display: 'none' },
							view: { width: '100%' },
						}[layout]
					}
				>
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
