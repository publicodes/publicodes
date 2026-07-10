import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface ApplicabilityMechanismProps {
	mechanism:
		| Ast.ApplicableIfMechanism
		| Ast.NotApplicableIfMechanism
		| Ast.IsApplicableMechanism
		| Ast.IsNotApplicableMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	applicable_if: "s'applique seulement si",
	not_applicable_if: "ne s'applique pas si",
	is_applicable: 'est applicable',
	is_not_applicable: "n'est pas applicable",
}

export function ApplicabilityMechanism({
	mechanism,
	trace,
}: ApplicabilityMechanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mechanism__label">{LABELS[mechanism.kind]}</span>
			<ChainedValue node={mechanism.parameters} trace={trace} />
		</>
	)
}
