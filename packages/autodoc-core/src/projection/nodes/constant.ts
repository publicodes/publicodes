import type * as Ast from '../../ast'
import { formatValue } from '../../format-value'
import type { Ctx, OperandView } from '../types'
import { expressionText } from '../expression-text'
import { lookupValue, unitOf } from '../value'

export function projectConstant(
	expression: Ast.ConstantExpression,
	ctx: Ctx,
	operator: string | null,
): OperandView {
	const parameters = expression.parameters
	const unit =
		parameters && 'unit' in parameters ? (parameters.unit ?? null) : null
	const term = expressionText(ctx.ast, expression)
	const view: OperandView = {
		operator,
		kind: 'constant',
		name: null,
		address: null,
		term:
			parameters?.kind === 'const_number' ?
				formatValue(parameters.value, { type: 'number', unit: unit ?? undefined })
			:	term,
		unit,
		value: lookupValue(ctx, expression.id, expression.type, unitOf(expression)),
		equation: null,
		keyword: null,
		applied: null,
		inert: false,
	}
	return view
}
