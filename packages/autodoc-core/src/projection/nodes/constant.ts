import type * as Ast from '../../ast'
import { formatValue } from '../../format-value'
import type { Ctx, RawOperand } from '../types'
import { expressionText } from '../expression-text'
import { lookupValue, unitOf } from '../value'

/** A literal is worth what it says; there is nothing else to decide about it. */
export function projectConstant(
	expression: Ast.ConstantExpression,
	ctx: Ctx,
): RawOperand {
	const parameters = expression.parameters
	const term = expressionText(ctx.ast, expression)
	return {
		id: null,
		name: null,
		address: null,
		description: null,
		parameter: null,
		term:
			parameters?.kind === 'const_number' ?
				formatValue(parameters.value, {
					type: 'number',
					unit: unitOf(expression),
				})
			:	term,
		named: null,
		value: lookupValue(ctx, expression.id, expression.type, unitOf(expression)),
		detail: null,
	}
}
