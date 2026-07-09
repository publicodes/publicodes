import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface BoundMecanismProps {
	mecanism: Ast.FloorMechanism | Ast.CeilingMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	ceiling: 'plafonné à',
	floor: 'plancher à',
}

export function BoundMecanism({ mecanism, trace }: BoundMecanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mecanism__label">{LABELS[mecanism.kind]}</span>
			<ChainedValue node={mecanism.parameters} trace={trace} />
		</>
	)
}
