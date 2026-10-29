import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { Explanation } from './Explanation'
import { ExplanationList } from './ExplanationList'

/**
 * The page's computation: the rule's answer, at the scale a page prints it, then the lines
 * that explain it. The answer is the one thing a page adds to an explanation — the styling
 * of a title line belongs here, and never to a reusable line.
 */
export function RuleComputation({
	view,
}: {
	view: RuleView
}): ReactElement | null {
	if (view.equation === null) return null
	return (
		<section className="publicodes-rule-computation">
			{view.answer !== null && <Explanation view={view.answer} head />}
			{(view.equation.rows.length > 0 || view.equation.note !== null) && (
				<ExplanationList view={view.equation} />
			)}
		</section>
	)
}
