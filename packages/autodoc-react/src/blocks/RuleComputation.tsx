import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { Equation } from './Equation'

export function RuleComputation({ view }: { view: RuleView }): ReactElement | null {
	if (view.equation === null) return null
	return (
		<section className="publicodes-rule-computation">
			{view.fillNote !== null && (
				<p className="publicodes-note">{view.fillNote}</p>
			)}
			<Equation view={view.equation} />
		</section>
	)
}
