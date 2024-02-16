import type {} from '@docusaurus/theme-classic' // required for @theme/CodeBlock types
import { usePrismTheme } from '@docusaurus/theme-common'
import styles from '@docusaurus/theme-live-codeblock/src/theme/Playground/styles.module.css'
import React from 'react'
import { Editor } from 'react-live'
import Documentation from './Documentation'
import ErrorBoundary from './ErrorBoundary'
import publicodeStyles from './publicodesExample.module.css'

type Props = {
	language: string
	defaultTarget: string
	onTargetChange: (target: string) => void
	onChange: (code: string) => void
	children: string
}

export default function Playground({
	language,
	defaultTarget,
	onTargetChange,
	onChange,
	children,
	...props
}: Props): JSX.Element {
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
					showDevSection={false}
				/>
				<div style={{ paddingBottom: '1rem' }} />
			</ErrorBoundary>
		</div>
	)
}
