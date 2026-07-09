import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { Expression } from './Expression'

export interface UnaryExpressionProps {
	expression: Ast.UnaryOperationExpression
	trace?: Trace
}

export function UnaryExpression({
	expression,
}: UnaryExpressionProps): JSX.Element {
	return (
		<span
			className={`publicodes-expression publicodes-expression--${expression.kind}`}
		>
			-
			<Expression expression={expression.parameters} />
		</span>
	)
}
