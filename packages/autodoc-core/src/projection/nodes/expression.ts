import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { contextInside, projectModifiers } from '../chained'
import { finishRow } from '../operand'
import { expressionText } from '../expression-text'
import { lookupValue, unitOf } from '../value'

export function projectExpr(
	node: Ast.ChainedValue,
	mechanism: Ast.ExpressionMechanism,
	ctx: Ctx,
): MechanismView {
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	const inner = contextInside(node, ctx)
	const only = ctx.projectExpression(mechanism.parameters, inner)
	// the mechanism only wraps an expression the parameter already is: taking that
	// mechanism as this one saves a level that says nothing, and its own modifiers
	// hang under the value they change like any others
	if (only.equation !== null) {
		return {
			...only.equation,
			modifiers: [
				...only.equation.modifiers,
				...projectModifiers(node, ctx, result),
			],
			result,
		}
	}
	const inlineTerm = expressionText(ctx.ast, mechanism.parameters)
	// a single literal that reads as the expression itself decomposes into nothing,
	// so the row keeps its value and opens onto nothing
	const literal =
		only.address === null && (only.term ?? only.value.text) === inlineTerm
	return {
		keyword: 'expression',
		inlineTerm,
		operands: literal ? [] : [finishRow(only, ctx, null, null)],
		modifiers: projectModifiers(node, ctx, result),
		result,
	}
}
