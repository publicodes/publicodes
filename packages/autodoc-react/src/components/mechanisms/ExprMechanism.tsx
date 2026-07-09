import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { Expression } from '../expressions/Expression'

export interface ExprMechanismProps {
	mechanism: Ast.ExpressionMechanism
	trace?: Trace
}

export function ExprMechanism({ mechanism, trace }: ExprMechanismProps): JSX.Element {
	return <Expression expression={mechanism.parameters} trace={trace} />
}
