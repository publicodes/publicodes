import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface ApplicabilityMecanismProps {
	mecanism: Ast.ApplicableIfMechanism | Ast.NotApplicableIfMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	applicable_if: "s'applique seulement si",
	not_applicable_if: "ne s'applique pas si",
}

export function ApplicabilityMecanism({
	mecanism,
	trace,
}: ApplicabilityMecanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mecanism__label">
				{LABELS[mecanism.kind]}
			</span>
			<ChainedValue node={mecanism.parameters} trace={trace} />
		</>
	)
}
