import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { Equation } from './Equation'
import type { Env } from './types'

export function RuleComputation({
	view,
	env,
}: {
	view: RuleView
	env: Env
}): ReactElement | null {
	if (!view.equation) return null
	return (
		<section className="publicodes-rule-computation">
			{view.fill === 'generic' && (
				<p className="publicodes-note">
					Aucun contexte n’a été fourni : les valeurs ne sont pas calculées.
				</p>
			)}
			<Equation equation={view.equation} env={env} head={view.name} />
		</section>
	)
}
