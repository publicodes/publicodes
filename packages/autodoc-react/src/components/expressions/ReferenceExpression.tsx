import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'

export interface ReferenceExpressionProps {
	expression: Ast.ReferenceExpression
	trace?: Trace
}

export function ReferenceExpression({
	expression,
}: ReferenceExpressionProps): JSX.Element {
	return (
		<span className="publicodes-expression publicodes-expression--ref">
			{expression.parameters}
		</span>
	)
}
