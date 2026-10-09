import type * as Ast from '../../ast'
import type { Ctx, EquationView, OperandView } from '../types'
import { expressionText } from '../expression-text'
import { lookupValue, unitOf } from '../value'

const OPERATORS: Record<Ast.BinaryOperationExpression['kind'], string> = {
	add: '+',
	sub: '−',
	mul: '×',
	div: '÷',
	pow: '^',
	gt: '>',
	lt: '<',
	gteq: '≥',
	lteq: '≤',
	eq: '=',
	noteq: '≠',
	and: 'et',
	or: 'ou',
	max: 'max',
	min: 'min',
}

export function projectBinary(
	expression: Ast.BinaryOperationExpression,
	ctx: Ctx,
	operator: string | null,
): OperandView {
	const left = ctx.projectExpression(expression.parameters.left, ctx, null)
	const right = ctx.projectExpression(
		expression.parameters.right,
		ctx,
		OPERATORS[expression.kind],
	)
	const result = lookupValue(ctx, expression.id, expression.type, unitOf(expression))
	const equation: EquationView = {
		keyword: 'expression',
		inlineTerm: expressionText(ctx.ast, expression),
		operands: [left, right],
		modifiers: [],
		result,
		inertCount: 0,
	}
	const view: OperandView = {
		operator,
		kind: 'equation',
		name: null,
		address: null,
		term: expressionText(ctx.ast, expression),
		unit: unitOf(expression) ?? null,
		value: result,
		equation,
		keyword: null,
		applied: null,
		inert: false,
	}
	return view
}
