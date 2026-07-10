import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ContextMechanism } from './mechanisms/ContextMechanism'
import { ApplicabilityMechanism } from './mechanisms/ApplicabilityMechanism'
import { DefaultMechanism } from './mechanisms/DefaultMechanism'
import { BoundMechanism } from './mechanisms/BoundMechanism'
import { RoundingMechanism } from './mechanisms/RoundingMechanism'
import { MechanismBox } from './MechanismBox'

export interface ChainedMechanismProps {
	mechanism: Ast.ChainedMechanism
	trace?: Trace
}

export function ChainedMechanism(props: ChainedMechanismProps): JSX.Element {
	const { mechanism, trace } = props

	let inner: JSX.Element | null
	switch (mechanism.kind) {
		case 'context':
			inner = <ContextMechanism mechanism={mechanism} trace={trace} />
			break
		case 'applicable_if':
		case 'not_applicable_if':
			inner = <ApplicabilityMechanism mechanism={mechanism} trace={trace} />
			break
		case 'type_def':
			inner = null
			break
		case 'default':
			inner = <DefaultMechanism mechanism={mechanism} trace={trace} />
			break
		case 'ceiling':
		case 'floor':
			inner = <BoundMechanism mechanism={mechanism} trace={trace} />
			break
		case 'round_up':
		case 'round_down':
		case 'round_nearest':
			inner = <RoundingMechanism mechanism={mechanism} trace={trace} />
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
