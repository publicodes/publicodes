import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { RuleLink } from './RuleLink'

export function RuleUsedBy({ view }: { view: RuleView }): ReactElement | null {
	if (view.usedBy.length === 0) return null
	return (
		<section className="publicodes-rule-used-by">
			<h2>Où cette valeur sert</h2>
			<ul>
				{view.usedBy.map((rule) => (
					<li key={rule.address}>
						<RuleLink address={rule.address}>{rule.name}</RuleLink>
					</li>
				))}
			</ul>
		</section>
	)
}
