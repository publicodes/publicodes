import React, { useEffect, useState } from 'react'
import { Editor } from 'react-live'
import { usePrismTheme } from '@docusaurus/theme-common'
import styles from '@docusaurus/theme-live-codeblock/src/theme/Playground/styles.module.css'
import type {} from '@docusaurus/theme-classic' // required for @theme/CodeBlock types
import CodeBlock from '@theme/CodeBlock'
import Documentation from './Documentation'
import ErrorBoundary from './ErrorBoundary'
import publicodeStyles from './publicodeExample.module.css'

function Playground({
	language,
	defaultTarget,
	onTargetChange,
	onChange,
	children,
	...props
}): JSX.Element {
	const prismTheme = usePrismTheme()

	return (
		<div className={styles.playgroundContainer}>
			<div className={styles.playgroundHeader}>Editeur live</div>
			<Editor
				{...props}
				code={children}
				theme={prismTheme}
				language={language}
				disabled={false}
				className={styles.playgroundEditor + ' ' + publicodeStyles.editor}
				onChange={onChange}
			/>
			<ErrorBoundary key={children}>
				<Documentation
					rules={children}
					defaultTarget={defaultTarget}
					onTargetChange={onTargetChange}
				/>
			</ErrorBoundary>
		</div>
	)
}

interface PublicodeExampleProps {
	rules: string
	meta?: string
}

export default function PublicodeExample({
	rules,
	meta,
}: PublicodeExampleProps) {
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
				<Playground
					language={language}
					defaultTarget={target}
					onTargetChange={setTarget}
					onChange={(text) => setCode(text)}
				>
					{code}
				</Playground>
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
