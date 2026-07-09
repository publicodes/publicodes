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

	const { kind, value } = expression.parameters
	const spec = { type: kind, ...('unit' in expression.parameters ? { unit: expression.parameters.unit } : {}) }

	return (
		<span className="publicodes-expression publicodes-expression--constant">
			{formatValue(value, spec as any)}
		</span>
	)
}
