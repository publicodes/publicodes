import type {} from '@docusaurus/theme-classic' // required for @theme/CodeBlock types
import CodeBlock from '@theme/CodeBlock'
import React, { lazy, Suspense, useEffect, useState } from 'react'
import publicodeStyles from './publicodesExample.module.css'
const Playground = lazy(() => import('./Playground'))

interface PublicodesExampleProps {
	rules: string
	meta?: string
}

export default function PublicodesExample({
	rules,
	meta,
}: PublicodesExampleProps) {
	const [code, setCode] = useState(rules.trim())
	const [edit, setEdit] = useState(false)
	const [target, setTarget] = useState(meta)

	// Use json lang instead of yaml for better highlight
	const language = 'json'

	useEffect(() => {
		if (!edit) {
			setCode(rules.trim())
		}
	}, [edit, rules])

	return (
		<div className={publicodeStyles.container}>
			{!edit ? (
				<CodeBlock language={language}>{code}</CodeBlock>
			) : (
				<Suspense fallback={<div>Chargement en cours</div>}>
					<Playground
						language={language}
						defaultTarget={target}
						onTargetChange={setTarget}
						onChange={(text) => setCode(text)}
					>
						{code}
					</Playground>
				</Suspense>
			)}
			<button
				className={publicodeStyles.button}
				onClick={() => setEdit((e) => !e)}
				style={edit ? { top: 0 } : { bottom: 0 }}
			>
				{!edit ? '⚡ Tester' : 'Fermer'}
			</button>
		</div>
	)
}
