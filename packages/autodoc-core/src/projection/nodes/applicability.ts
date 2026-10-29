import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { projectModifiers } from '../chained'
import { projectOperand } from '../operand'
import { lookupValue, unitOf } from '../value'

export function projectApplicability(
	node: Ast.ChainedValue,
	mechanism:
		| Ast.IsApplicableMechanism
		| Ast.IsNotApplicableMechanism
		| Ast.IsDefinedMechanism
		| Ast.IsNotDefinedMechanism,
	ctx: Ctx,
	keyword: string,
): MechanismView {
	const result = lookupValue(
		ctx,
		mechanism.id,
		mechanism.type,
		unitOf(mechanism),
	)
	const operand = projectOperand(mechanism.parameters, ctx, null, null)
	return {
		keyword,
		inlineTerm: operand.label,
		operands: [operand],
		modifiers: projectModifiers(node, ctx, result),
		result,
	}
}
