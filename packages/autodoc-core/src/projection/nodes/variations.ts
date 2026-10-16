import type * as Ast from '../../ast'
import type {
	Ctx,
	EquationView,
	MechanismView,
	OperandView,
	RawOperand,
	ValueView,
} from '../types'
import { projectModifiers } from '../chained'
import { finishRow } from '../operand'
import { lookupValue, unitOf } from '../value'

/** A branch of a conditional, as a row: what it is written as, and what it holds. */
const rawRow = (
	child: Ast.ChainedValue,
	detail: EquationView | null,
	value: ValueView,
): RawOperand => ({
	id: child.value_mechanism.id,
	name: null,
	address: null,
	description: null,
	parameter: null,
	term: detail?.inlineTerm ?? null,
	named: null,
	value,
	detail,
})

/**
 * The retained branch is read from the trace's recorded condition values: the first
 * condition that holds, or the `sinon`. A mechanism whose own value never resolved took
 * no branch at all.
 *
 * Each row carries what it is, not only its value: the `si` row shows the condition as
 * notation, the `alors` and `sinon` rows the consequence. The branches the trace did not
 * retain are the ones that had no effect: marked as such, they are held back by the
 * sheet's fold until the reader asks for them.
 */
export function projectVariations(
	node: Ast.ChainedValue,
	mechanism: Ast.VariationMechanism,
	ctx: Ctx,
): MechanismView {
	const result = lookupValue(
		ctx,
		mechanism.id,
		mechanism.type,
		unitOf(mechanism),
	)
	// a branch opens a sheet of its own, one level in
	const sheet = { ...ctx, depth: ctx.depth + 1 }
	const unresolved =
		result.state === 'not_defined' || result.state === 'not_applicable'
	const operands: OperandView[] = []
	let settled = false
	let retainedTerm: string | null = null

	for (const condition of mechanism.parameters.conditions) {
		const conditionSheet = ctx.projectNode(condition.if, sheet)
		const traced =
			conditionSheet?.result ??
			lookupValue(
				ctx,
				condition.if.value_mechanism.id,
				condition.if.value_mechanism.type,
				unitOf(condition.if.value_mechanism),
			)
		// a condition before the branch that applied was examined and failed, so its value
		// is false where the engine recorded nothing. After it, it was never examined.
		const examined = !unresolved && !settled && traced.state === 'absent'
		const conditionValue: ValueView =
			examined ? { state: 'value', value: false, text: 'non' } : traced
		const holds = !unresolved && !settled && conditionValue.value === true
		const thenSheet = ctx.projectNode(condition.then, sheet)
		if (holds) retainedTerm = thenSheet?.inlineTerm ?? null
		operands.push(
			{
				...finishRow(
					rawRow(condition.if, conditionSheet, conditionValue),
					ctx,
					null,
					'si',
				),
				inert: !holds,
			},
			{
				...finishRow(
					rawRow(
						condition.then,
						thenSheet,
						thenSheet?.result ?? conditionValue,
					),
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
	const keptElse = elseNode !== undefined && !unresolved && !settled
	if (elseNode !== undefined) {
		const elseSheet = ctx.projectNode(elseNode, sheet)
		if (keptElse) retainedTerm = elseSheet?.inlineTerm ?? null
		operands.push({
			...finishRow(
				rawRow(elseNode, elseSheet, elseSheet?.result ?? result),
				ctx,
				null,
				'sinon',
			),
			inert: !keptElse,
		})
	}

	return {
		keyword: 'variations',
		inlineTerm: retainedTerm,
		operands,
		// a `sinon` kept says the conditions were tried and failed: without them the sheet
		// prints a rate that nothing accounts for, so they come with it
		expandedByDefault: keptElse,
		modifiers: projectModifiers(node, ctx, result),
		result,
	}
}
