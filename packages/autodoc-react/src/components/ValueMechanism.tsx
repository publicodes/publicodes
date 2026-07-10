import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { Expression } from './expressions/Expression'
import { Value } from './mechanisms/Value'
import { ApplicabilityMechanism } from './mechanisms/ApplicabilityMechanism'
import { FoldMechanism } from './mechanisms/FoldMechanism'
import { CombinationMechanism } from './mechanisms/CombinationMechanism'
import { BoundaryMechanism } from './mechanisms/BoundaryMechanism'
import { VariationsMechanism } from './mechanisms/VariationsMechanism'
import { MechanismBox } from './MechanismBox'

export interface ValueMechanismProps {
	mechanism: Ast.ValueMechanism
	trace?: Trace
}

export function ValueMechanism(props: ValueMechanismProps): JSX.Element {
	const { mechanism, trace } = props

	let inner: JSX.Element | null
	switch (mechanism.kind) {
		case 'expr':
			inner = <Expression expression={mechanism.parameters} trace={trace} />
			break
		case 'value':
			inner = <Value mechanism={mechanism} trace={trace} />
			break
		case 'is_applicable':
		case 'is_not_applicable':
			inner = <ApplicabilityMechanism mechanism={mechanism} trace={trace} />
			break
		case 'sum':
		case 'product':
			inner = <FoldMechanism mechanism={mechanism} trace={trace} />
			break
		case 'all_of':
		case 'one_of':
			inner = <CombinationMechanism mechanism={mechanism} trace={trace} />
			break
		case 'min_of':
		case 'max_of':
			inner = <BoundaryMechanism mechanism={mechanism} trace={trace} />
			break
		case 'not_defined':
			inner = null
			break
		case 'variations':
			inner = <VariationsMechanism mechanism={mechanism} trace={trace} />
			break
		default:
			return mechanism satisfies never
	}

	return (
		<MechanismBox mechanism={mechanism} trace={trace}>
			{inner}
		</MechanismBox>
	)
}
