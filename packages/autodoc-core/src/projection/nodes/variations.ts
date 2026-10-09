import type * as Ast from '../../ast'
import type { Ctx, EquationView, OperandView } from '../types'
import { contextInside, projectModifiers } from '../chained'
import { lookupValue, unitOf } from '../value'

/**
 * The applied branch is read from the trace's recorded condition values: the
 * first condition that holds, or the `sinon`. A mechanism whose own value never
 * resolved took no branch at all.
 *
 * Each row carries what it is, not only its value: the `si` row shows the
 * condition as notation, the `alors` and `sinon` rows the consequence.
 */
export function projectVariations(
	node: Ast.ChainedValue,
	mechanism: Ast.VariationMechanism,
	ctx: Ctx,
): EquationView {
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	const inner = contextInside(node, ctx)
	const unresolved =
		result.state === 'not_defined' || result.state === 'not_applicable'
	const operands: OperandView[] = []
	let inertCount = 0
	let settled = false
	let appliedTerm: string | null = null

	for (const condition of mechanism.parameters.conditions) {
		const conditionEquation = ctx.projectNode(condition.if, inner)
		const conditionValue = conditionEquation?.result ?? lookupValue(inner, condition.if.value_mechanism.id, condition.if.value_mechanism.type, unitOf(condition.if.value_mechanism))
		const holds = !unresolved && !settled && conditionValue.value === true
		const thenEquation = ctx.projectNode(condition.then, inner)
		if (!holds) inertCount += 1
		if (holds) appliedTerm = thenEquation?.inlineTerm ?? null
		operands.push(
			{
				operator: null,
				kind: 'equation',
				name: null,
				address: null,
				term: conditionEquation?.inlineTerm ?? null,
				unit: null,
				value: conditionValue,
				// the condition is itself something to unfold
				equation: conditionEquation,
				keyword: 'si',
				applied: holds,
				inert: !holds,
			},
			{
				operator: null,
				kind: 'equation',
				name: null,
				address: null,
				term: thenEquation?.inlineTerm ?? null,
				unit: unitOf(condition.then.value_mechanism) ?? null,
				value: thenEquation?.result ?? conditionValue,
				equation: thenEquation,
				keyword: 'alors',
				applied: holds,
				inert: !holds,
			},
		)
		if (holds) settled = true
	}

	const elseNode = mechanism.parameters.else
	if (elseNode) {
		const applied = !unresolved && !settled
		const elseEquation = ctx.projectNode(elseNode, inner)
		if (!applied) inertCount += 1
		if (applied) appliedTerm = elseEquation?.inlineTerm ?? null
		operands.push({
			operator: null,
			kind: 'equation',
			name: null,
			address: null,
			term: elseEquation?.inlineTerm ?? null,
			unit: unitOf(elseNode.value_mechanism) ?? null,
			value: elseEquation?.result ?? result,
			equation: elseEquation,
			keyword: 'sinon',
			applied,
			inert: !applied,
		})
	}

	return {
		keyword: 'variations',
		inlineTerm: appliedTerm,
		operands,
		modifiers: projectModifiers(node, ctx, result),
		result,
		inertCount,
	}
}
