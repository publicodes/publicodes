import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface RoundingMechanismProps {
	mechanism:
		| Ast.RoundUpMechanism
		| Ast.RoundDownMechanism
		| Ast.RoundNearestMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	round_up: 'arrondi au supérieur à',
	round_down: "arrondi à l'inférieur à",
	round_nearest: 'arrondi à',
}

export function RoundingMechanism({
	mechanism,
	trace,
}: RoundingMechanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mechanism__label">
				{LABELS[mechanism.kind]}
			</span>
			<ChainedValue node={mechanism.parameters} trace={trace} />
		</>
	)
}
