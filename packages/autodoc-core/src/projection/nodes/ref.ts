import type * as Ast from '../../ast'
import { displayName } from '../names'
import { parameterState } from '../operand'
import type { Ctx, RawOperand } from '../types'
import { lookupValue, unitOf } from '../value'

/**
 * A reference shows the referenced rule's name — relative to the rule being
 * read, which is how the author writes them — and nothing else in the flow.
 */
export function projectRef(
	expression: Ast.ReferenceExpression,
	ctx: Ctx,
): RawOperand {
	const name = displayName(ctx.ast, expression.parameters)
	return {
		id: null,
		name,
		address: expression.parameters,
		description: ctx.ast[expression.parameters]?.description ?? null,
		parameter: parameterState(expression.parameters, ctx),
		term: name,
		named: null,
		value: lookupValue(ctx, expression.id, expression.type, unitOf(expression)),
		detail: null,
	}
}
