import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'

export function RuleProvenance({
	position,
}: {
	position: RuleView['position']
}): ReactElement {
	return (
		<footer className="publicodes-rule-provenance">
			<h2>Provenance</h2>
			<p>
				Règle écrite dans{' '}
				<span className="publicodes-address">{position.file}</span>, ligne{' '}
				<span className="publicodes-address">{position.line}</span>.
			</p>
		</footer>
	)
}
