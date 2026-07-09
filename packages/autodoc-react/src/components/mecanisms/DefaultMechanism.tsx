import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface DefaultMechanismProps {
	mecanism: Ast.DefaultMechanism
	trace?: Trace
}

export function DefaultMechanism({
	mecanism,
	trace,
}: DefaultMechanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mecanism__label">par défaut :</span>
			<ChainedValue node={mecanism.parameters} trace={trace} />
		</>
	)
}
