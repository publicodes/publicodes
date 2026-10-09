import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { projectModifiers } from '../chained'
import { lookupValue, unitOf } from '../value'

export function projectNotDefined(
	node: Ast.ChainedValue,
	mechanism: Ast.NotDefined,
	ctx: Ctx,
): EquationView {
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	return {
		keyword: null,
		inlineTerm: null,
		operands: [],
		modifiers: projectModifiers(node, ctx, result),
		result,
		inertCount: 0,
	}
}
