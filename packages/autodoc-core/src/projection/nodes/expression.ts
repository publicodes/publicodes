import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { projectModifiers } from '../chained'
import { finishRow } from '../operand'
import { expressionText } from '../expression-text'
import { binaryMechanism, isBinaryOperation } from './binary'
import { unaryMechanism } from './unary'
import { lookupValue, unitOf } from '../value'

export function projectExpr(
	node: Ast.ChainedValue,
	mechanism: Ast.ExpressionMechanism,
	ctx: Ctx,
): MechanismView {
	const own = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	// the mechanism only wraps an expression the parameter already is: taking that
	// mechanism as this one saves a level that says nothing, and its own modifiers
	// hang under the value they change like any others
	const wrapped =
		isBinaryOperation(mechanism.parameters) ?
			binaryMechanism(mechanism.parameters, ctx)
		: mechanism.parameters.kind === 'neg' ?
			unaryMechanism(mechanism.parameters, ctx)
		:	null
	if (wrapped !== null) {
		// an `expr` node exists to be compiled: where the engine wrote none for it, what
		// the row is worth is what the operation it carries is worth
		const value = own.state === 'absent' ? wrapped.result : own
		return {
			...wrapped,
			modifiers: [...wrapped.modifiers, ...projectModifiers(node, ctx, value)],
			result: value,
		}
	}
	const only = ctx.projectExpression(mechanism.parameters, ctx)
	const inlineTerm = expressionText(ctx.ast, mechanism.parameters)
	const value = own.state === 'absent' ? only.value : own
	// a single literal that reads as the expression itself decomposes into nothing,
	// so the row keeps its value and opens onto nothing
	const literal =
		only.address === null && (only.term ?? only.value.text) === inlineTerm
	return {
		keyword: 'expression',
		inlineTerm,
		operands: literal ? [] : [finishRow(only, ctx, null, null)],
		modifiers: projectModifiers(node, ctx, value),
		result: value,
	}
}
