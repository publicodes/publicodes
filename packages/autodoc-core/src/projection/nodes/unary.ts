import type * as Ast from '../../ast'
import type { Ctx, EquationView, OperandView } from '../types'
import { expressionText } from '../expression-text'
import { lookupValue, unitOf } from '../value'

export function projectUnary(
	expression: Ast.UnaryOperationExpression,
	ctx: Ctx,
	operator: string | null,
): OperandView {
	const inner = ctx.projectExpression(expression.parameters, ctx, null)
	const result = lookupValue(ctx, expression.id, expression.type, unitOf(expression))
	const text = expressionText(ctx.ast, expression)
	const equation: EquationView = {
		keyword: null,
		inlineTerm: text,
		operands: [inner],
		modifiers: [],
		result,
		inertCount: 0,
	}
	const view: OperandView = {
		operator,
		kind: 'equation',
		name: null,
		address: null,
		term: text,
		unit: unitOf(expression) ?? null,
		value: result,
		equation,
		keyword: null,
		applied: null,
		inert: false,
	}
	return view
}
