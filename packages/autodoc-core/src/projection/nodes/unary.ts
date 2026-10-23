import type * as Ast from '../../ast'
import type { Ctx, MechanismView, RawOperand } from '../types'
import { expressionText } from '../expression-text'
import { finishEquation, finishRow } from '../operand'
import { lookupValue, unitOf } from '../value'

/**
 * A negation as a mechanism, kept apart from the row for the same reason an operation
 * is: an expression wrapping one takes it as its own.
 */
export function unaryMechanism(
	expression: Ast.UnaryOperationExpression,
	ctx: Ctx,
): MechanismView {
	const text = expressionText(ctx.ast, expression)
	return {
		keyword: null,
		inlineTerm: text,
		operands: [
			finishRow(ctx.projectExpression(expression.parameters, ctx), ctx, null, null),
		],
		modifiers: [],
		result: lookupValue(ctx, expression.id, expression.type, unitOf(expression)),
	}
}

export function projectUnary(
	expression: Ast.UnaryOperationExpression,
	ctx: Ctx,
): RawOperand {
	const equation = unaryMechanism(expression, ctx)
	return {
		id: expression.id,
		name: null,
		address: null,
		description: null,
		parameter: null,
		term: equation.inlineTerm,
		named: null,
		value: equation.result,
		detail: finishEquation(equation, { ...ctx, depth: ctx.depth + 1 }, expression.id),
	}
}
