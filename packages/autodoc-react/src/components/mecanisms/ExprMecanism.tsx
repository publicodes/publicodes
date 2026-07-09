import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { Expression } from '../expressions/Expression'

export interface ExprMecanismProps {
	mecanism: Ast.ExpressionMechanism
	trace?: Trace
}

export function ExprMecanism({ mecanism, trace }: ExprMecanismProps): JSX.Element {
	return <Expression expression={mecanism.parameters} trace={trace} />
}
