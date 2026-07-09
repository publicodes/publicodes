import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface BoundMechanismProps {
	mechanism: Ast.FloorMechanism | Ast.CeilingMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	ceiling: 'plafonné à',
	floor: 'plancher à',
}

export function BoundMechanism({ mechanism, trace }: BoundMechanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mechanism__label">{LABELS[mechanism.kind]}</span>
			<ChainedValue node={mechanism.parameters} trace={trace} />
		</>
	)
}
