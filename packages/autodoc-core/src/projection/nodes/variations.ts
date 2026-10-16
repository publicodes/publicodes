import type * as Ast from '../../ast'
import type {
	Ctx,
	EquationView,
	MechanismView,
	OperandView,
	RawOperand,
	ValueView,
} from '../types'
import { contextInside, projectModifiers } from '../chained'
import { asMechanism, finishRow } from '../operand'
import { lookupValue, unitOf } from '../value'

/** A branch of a conditional, as a row: what it is written as, and what it holds. */
const rawRow = (
	child: Ast.ChainedValue,
	equation: EquationView | null,
	value: ValueView,
): RawOperand => ({
	id: child.value_mechanism.id,
	name: null,
	address: null,
	description: null,
	parameter: null,
	term: equation?.inlineTerm ?? null,
	named: null,
	value,
	equation: equation === null ? null : asMechanism(equation),
})

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
): MechanismView {
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	const inner = contextInside(node, ctx)
	const unresolved =
		result.state === 'not_defined' || result.state === 'not_applicable'
	const operands: OperandView[] = []
	let settled = false
	let appliedTerm: string | null = null

	for (const condition of mechanism.parameters.conditions) {
		const conditionEquation = ctx.projectNode(condition.if, inner)
		const traced =
			conditionEquation?.result ??
			lookupValue(
				inner,
				condition.if.value_mechanism.id,
				condition.if.value_mechanism.type,
				unitOf(condition.if.value_mechanism),
			)
		// a condition before the branch that applied was examined and failed, so
		// its value is false where the engine recorded nothing. After it, a
		// condition was never examined and keeps its silence.
		const examined = !unresolved && !settled && traced.state === 'absent'
		const conditionValue: ValueView =
			examined ? { state: 'value', value: false, text: 'non' } : traced
		const holds = !unresolved && !settled && conditionValue.value === true
		const thenEquation = ctx.projectNode(condition.then, inner)
		if (holds) appliedTerm = thenEquation?.inlineTerm ?? null
		operands.push(
			{
				...finishRow(
					rawRow(condition.if, conditionEquation, conditionValue),
					ctx,
					null,
					'si',
				),
				inert: !holds,
			},
			{
				...finishRow(
					rawRow(condition.then, thenEquation, thenEquation?.result ?? conditionValue),
					ctx,
					null,
					'alors',
				),
				inert: !holds,
			},
		)
		if (holds) settled = true
	}

	const elseNode = mechanism.parameters.else
	if (elseNode) {
		const applied = !unresolved && !settled
		const elseEquation = ctx.projectNode(elseNode, inner)
		if (applied) appliedTerm = elseEquation?.inlineTerm ?? null
		operands.push({
			...finishRow(
				rawRow(elseNode, elseEquation, elseEquation?.result ?? result),
				ctx,
				null,
				'sinon',
			),
			inert: !applied,
		})
	}

	return {
		keyword: 'variations',
		inlineTerm: appliedTerm,
		operands,
		modifiers: projectModifiers(node, ctx, result),
		result,
	}
}
