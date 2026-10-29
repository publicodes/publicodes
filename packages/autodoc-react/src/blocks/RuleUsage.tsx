import type { OperandView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { Explanation } from './Explanation'

/**
 * The results whose computation needs this rule, written as the lines of a computation:
 * a name, the way to its page, and nothing else. A result has none — the module lists
 * parameters, and only parameters — so this is the block a parameter gets and a result
 * does not.
 */
export function RuleUsage({
	rows,
}: {
	rows: OperandView[]
}): ReactElement | null {
	if (rows.length === 0) return null
	return (
		<section className="publicodes-rule-usage">
			<h2>Utilisé pour le calcul</h2>
			<div className="publicodes-equation">
				{rows.map((row) => (
					<Explanation key={row.id} view={row} flush />
				))}
			</div>
		</section>
	)
}
