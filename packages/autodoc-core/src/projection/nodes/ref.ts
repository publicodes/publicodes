import type * as Ast from '../../ast'
import { displayName } from '../names'
import type { Ctx, OperandView } from '../types'
import { lookupValue, unitOf } from '../value'

/**
 * A reference shows the referenced rule's name — relative to the rule being
 * read, which is how the author writes them — and nothing else in the flow.
 */
export function projectRef(
	expression: Ast.ReferenceExpression,
	ctx: Ctx,
	operator: string | null,
): OperandView {
	const name = displayName(ctx.ast, expression.parameters)
	const view: OperandView = {
		operator,
		kind: 'ref',
		name,
		address: expression.parameters,
		term: name,
		unit: unitOf(ctx.ast[expression.parameters]) ?? null,
		value: lookupValue(ctx, expression.id, expression.type, unitOf(expression)),
		equation: null,
		keyword: null,
		applied: null,
		inert: false,
	}
	return view
}
