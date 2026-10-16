import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { ContextTable } from './ContextTable'

/** The context of the computation: one style, the state as a quiet qualifier. */
export function RuleParameters({
	view,
}: {
	view: RuleView
}): ReactElement | null {
	if (view.context.length === 0) return null
	return (
		<section className="publicodes-rule-parameters">
			<h2>Contexte du calcul</h2>
			<ContextTable entries={view.context} />
		</section>
	)
}
