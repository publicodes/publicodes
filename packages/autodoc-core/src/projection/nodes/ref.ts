import type * as Ast from '../../ast'
import { displayName } from '../names'
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
	// une référence vaut ce que vaut la règle qu'elle nomme, type et unité compris : le
	// compilateur ne les écrit pas toujours sur le nœud, notamment dans ce qu'un `contexte` lie
	const target = ctx.ast[expression.parameters]?.value_mechanism
	return {
		id: null,
		name,
		address: expression.parameters,
		description: ctx.ast[expression.parameters]?.description ?? null,
		term: name,
		named: null,
		value: lookupValue(
			ctx,
			expression.id,
			target?.type ?? expression.type,
			target === undefined ? unitOf(expression) : unitOf(target),
		),
		detail: null,
	}
}
