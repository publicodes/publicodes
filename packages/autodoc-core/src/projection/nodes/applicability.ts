import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { contextInside, projectModifiers } from '../chained'
import { projectOperand } from '../operand'
import { lookupValue, unitOf } from '../value'

export function projectApplicability(
	node: Ast.ChainedValue,
	mechanism: Ast.IsApplicableMechanism | Ast.IsNotApplicableMechanism,
	ctx: Ctx,
	keyword: string,
): EquationView {
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	const inner = contextInside(node, ctx)
	const operand = projectOperand(mechanism.parameters, inner, null, null)
	return {
		keyword,
		inlineTerm: operand.term,
		operands: [operand],
		modifiers: projectModifiers(node, ctx, result),
		result,
		inertCount: 0,
	}
}
