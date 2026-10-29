import type { ContextBlockView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { ExplanationList } from './ExplanationList'
import { RuleLink } from './RuleLink'

/**
 * The context the page is read in: the trail of stacked contexts, then the parameters the
 * computation read — written as the lines of a computation, because that is what they are,
 * one level up. The trail is also the way back: every step leads to the same rule, read one
 * context up.
 */
export function RuleContext({
	view,
}: {
	view: ContextBlockView
}): ReactElement | null {
	const empty = (view.equation.rows[0]?.detail?.rows ?? []).length === 0
	if (empty) return null
	const current = view.crumbs.length - 1
	return (
		<section className="publicodes-rule-context">
			<h2>Contexte du calcul</h2>
			{current > 0 && (
				<nav className="publicodes-context-crumbs" aria-label="Contextes">
					<ol>
						{view.crumbs.map((crumb, index) => (
							<li key={crumb.stack || 'base'}>
								{index === current ?
									<span aria-current="page">{crumb.name}</span>
								:	<RuleLink address={crumb.rule} stack={crumb.stack}>
										{crumb.name}
									</RuleLink>
								}
							</li>
						))}
					</ol>
				</nav>
			)}
			<ExplanationList view={view.equation} />
		</section>
	)
}
