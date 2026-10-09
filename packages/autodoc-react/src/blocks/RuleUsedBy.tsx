import type { RuleView } from '@publicodes/autodoc-core'
import { displayName } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { RuleLink } from './RuleLink'
import type { Env } from './types'

export function RuleUsedBy({
	view,
	env,
}: {
	view: RuleView
	env: Env
}): ReactElement | null {
	if (view.usedBy.length === 0) return null
	return (
		<section className="publicodes-rule-used-by">
			<h2>Où cette valeur sert</h2>
			<ul>
				{view.usedBy.map((name) => (
					<li key={name}>
						<RuleLink address={name}>{displayName(env.ast, name)}</RuleLink>
					</li>
				))}
			</ul>
		</section>
	)
}
