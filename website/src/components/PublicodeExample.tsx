import React, { useState } from 'react'
import { Editor } from 'react-live'
import clsx from 'clsx'
import { usePrismTheme } from '@docusaurus/theme-common'
import styles from '@docusaurus/theme-live-codeblock/src/theme/Playground/styles.module.css'
import CodeBlock from '@theme/CodeBlock'
import Documentation from './Documentation'

function Playground({ children, language, onChange, ...props }): JSX.Element {
	const prismTheme = usePrismTheme()

	return (
		<div className={styles.playgroundContainer}>
			<div className={clsx(styles.playgroundHeader)}>Live Editor</div>
			<Editor
				{...props}
				code={children}
				theme={prismTheme}
				language={language}
				disabled={false}
				className={styles.playgroundEditor}
				onChange={onChange}
			/>
			<Documentation rules={children} />
		</div>
	)
}

interface PublicodeExampleProps {
	rules: string
}

export default function PublicodeExample({ rules }: PublicodeExampleProps) {
	const [code, setCode] = useState(rules.trim())
	const [edit, setEdit] = useState(false)

	// Use jsx lang instead of yaml for better highlight
	const language = 'jsx'

	return (
		<div style={{ position: 'relative', backgroundColor: '#f1f2f3' }}>
			{!edit ? (
				<CodeBlock language={language}>{code}</CodeBlock>
			) : (
				<Playground language={language} onChange={(text) => setCode(text)}>
					{code}
				</Playground>
			)}
			<button
				onClick={() => setEdit((e) => !e)}
				style={{
					position: 'absolute',
					...(edit ? { top: 0 } : { bottom: 0 }),
					right: 0,
					margin: '0.8rem',
				}}
			>
				{!edit ? 'Live edit' : 'Close'}
			</button>
		</div>
	)
}
