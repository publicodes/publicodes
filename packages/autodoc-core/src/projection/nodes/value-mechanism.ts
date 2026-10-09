import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { contextInside, projectModifiers } from '../chained'
import { lookupValue, unitOf } from '../value'

export function projectValueMechanism(
	node: Ast.ChainedValue,
	mechanism: Ast.Value,
	ctx: Ctx,
): EquationView | null {
	const inner = ctx.projectNode(mechanism.parameters, contextInside(node, ctx))
	if (!inner) return null
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	return {
		...inner,
		modifiers: [...inner.modifiers, ...projectModifiers(node, ctx, result)],
		result: result.state === 'absent' ? inner.result : result,
	}
}
