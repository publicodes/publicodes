import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { contextInside, projectModifiers } from '../chained'
import { lookupValue, unitOf } from '../value'

/** `valeur` says what it holds: same mechanism, with its own modifiers. */
export function projectValueMechanism(
	node: Ast.ChainedValue,
	mechanism: Ast.Value,
	ctx: Ctx,
): MechanismView | null {
	const inner = ctx.projectNode(mechanism.parameters, contextInside(node, ctx))
	if (!inner) return null
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	return {
		keyword: inner.keyword,
		inlineTerm: inner.inlineTerm,
		operands: inner.rows,
		modifiers: projectModifiers(node, ctx, result),
		result: result.state === 'absent' ? inner.result : result,
	}
}
