import type * as Ast from '../../ast'
import type { Ctx, RawOperand } from '../types'
import { expressionText } from '../expression-text'
import { finishRow } from '../operand'
import { lookupValue, unitOf } from '../value'

export function projectUnary(
	expression: Ast.UnaryOperationExpression,
	ctx: Ctx,
): RawOperand {
	const inner = ctx.projectExpression(expression.parameters, ctx)
	const result = lookupValue(ctx, expression.id, expression.type, unitOf(expression))
	const text = expressionText(ctx.ast, expression)
	return {
		id: expression.id,
		name: null,
		address: null,
		description: null,
		parameter: null,
		term: text,
		named: null,
		value: result,
		equation: {
			keyword: null,
			inlineTerm: text,
			operands: [finishRow(inner, ctx, null, null)],
			modifiers: [],
			result,
		},
	}
}
