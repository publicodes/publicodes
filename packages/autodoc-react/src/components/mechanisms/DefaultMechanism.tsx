import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface DefaultMechanismProps {
	mechanism: Ast.DefaultMechanism
	trace?: Trace
}

export function DefaultMechanism({
	mechanism,
	trace,
}: DefaultMechanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mechanism__label">par défaut</span>
			<ChainedValue node={mechanism.parameters} trace={trace} />
		</>
	)
}
