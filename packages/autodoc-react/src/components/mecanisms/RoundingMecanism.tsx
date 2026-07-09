import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface RoundingMecanismProps {
	mecanism:
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

export function RoundingMecanism({
	mecanism,
	trace,
}: RoundingMecanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mecanism__label">
				{LABELS[mecanism.kind]}
			</span>
			<ChainedValue node={mecanism.parameters} trace={trace} />
		</>
	)
}
