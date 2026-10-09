import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { contextInside, projectModifiers } from '../chained'
import { expressionText } from '../expression-text'
import { lookupValue, unitOf } from '../value'

export function projectExpr(
	node: Ast.ChainedValue,
	mechanism: Ast.ExpressionMechanism,
	ctx: Ctx,
): EquationView {
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	const inner = contextInside(node, ctx)
	const only = ctx.projectExpression(mechanism.parameters, inner, null)
	const modifiers = [
		...(only.equation?.modifiers ?? []),
		...projectModifiers(node, ctx, result),
	]
	// the mechanism only wraps an expression the parameter already is, under the
	// same text: taking its equation as this one saves a level that says nothing
	if (only.equation !== null) return { ...only.equation, modifiers, result }
	const inlineTerm = expressionText(ctx.ast, mechanism.parameters)
	// a single literal that reads as the expression itself decomposes into
	// nothing, so the row keeps its value and opens onto nothing
	const literal =
		only.equation === null &&
		only.address === null &&
		(only.term ?? only.value.text) === inlineTerm
	return {
		keyword: 'expression',
		inlineTerm,
		operands: literal ? [] : [only],
		modifiers,
		result,
		inertCount: 0,
	}
}
