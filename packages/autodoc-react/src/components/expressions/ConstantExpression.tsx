import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { formatValue } from '@publicodes/autodoc-core'

export interface ConstantExpressionProps {
	expression: Ast.ConstantExpression
	trace?: Trace
}

export function ConstantExpression({
	expression,
}: ConstantExpressionProps): JSX.Element | null {
	if (!expression.parameters) return null

	const {  value } = expression.parameters

	return (
		<span className="publicodes-expression publicodes-expression--constant">
			{formatValue(value, expression)}
		</span>
	)
}
