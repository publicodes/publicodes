import type * as Ast from '../../ast'
import type { Ctx, MechanismView, RawOperand } from '../types'
import { expressionText } from '../expression-text'
import { finishRow } from '../operand'
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
): RawOperand {
	const left = finishRow(
		ctx.projectExpression(expression.parameters.left, ctx),
		ctx,
		null,
		null,
	)
	const right = finishRow(
		ctx.projectExpression(expression.parameters.right, ctx),
		ctx,
		OPERATORS[expression.kind],
		null,
	)
	const result = lookupValue(ctx, expression.id, expression.type, unitOf(expression))
	const equation: MechanismView = {
		keyword: 'expression',
		inlineTerm: expressionText(ctx.ast, expression),
		operands: [left, right],
		modifiers: [],
		result,
	}
	return {
		id: expression.id,
		name: null,
		address: null,
		description: null,
		parameter: null,
		term: expressionText(ctx.ast, expression),
		named: null,
		value: result,
		equation,
	}
}
