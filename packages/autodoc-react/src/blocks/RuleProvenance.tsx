import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'

export function RuleProvenance({ view }: { view: RuleView }): ReactElement {
	return (
		<footer className="publicodes-rule-provenance">
			<h2>Provenance</h2>
			<p>
				Règle écrite dans <span className="publicodes-address">{view.position.file}</span>,
				ligne <span className="publicodes-address">{view.position.line}</span>.
			</p>
		</footer>
	)
}
