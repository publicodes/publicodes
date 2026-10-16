import type * as Ast from '../../ast'
import type { Ctx, MechanismView, OperandView, ValueView } from '../types'
import { contextInside, projectModifiers } from '../chained'
import { projectOperand } from '../operand'
import { lookupValue, textOf, unitOf } from '../value'

export type ListMechanism =
	| Ast.SumMechanism
	| Ast.ProductMechanism
	| Ast.AllOfMechanism
	| Ast.OneOfMechanism
	| Ast.MinOfMechanism
	| Ast.MaxOfMechanism

/**
 * A term that contributes nothing: zero in a sum, one in a product, and a term
 * the rule does not apply to. Compared on the value, never on its formatted
 * text, which carries the unit.
 */
const hadNoEffect = (keyword: string, value: ValueView): boolean => {
	if (value.state === 'not_applicable') return true
	if (value.state !== 'value' || typeof value.value !== 'number') return false
	return keyword === 'produit' ? value.value === 1 : value.value === 0
}

/**
 * A composing mechanism with a list of operands: one row per operand, the
 * operator on the left of each after the first. Terms that contributed nothing
 * are marked so the view can fold them away.
 */
export function projectList(
	node: Ast.ChainedValue,
	mechanism: ListMechanism,
	ctx: Ctx,
	keyword: string,
	operator: string,
): MechanismView {
	const result = lookupValue(ctx, mechanism.id, mechanism.type, unitOf(mechanism))
	const inner = contextInside(node, ctx)

	const operands: OperandView[] = mechanism.parameters.map((operand, index) => {
		const view = projectOperand(operand, inner, index === 0 ? null : operator, null)
		const inert = hadNoEffect(keyword, view.value)
		return { ...view, inert }
	})

	const inlineTerm =
		operands.length === 0 ?
			null
		:	operands
				.map((operand, index) => {
					// a mechanism's own word is not a written form: the value stands for it
					const written =
						operand.termIsMechanism ? null : operand.term
					const text = written ?? textOf(operand.value) ?? ''
					return index === 0 ? text : `${operator} ${text}`
				})
				.join(' ')

	return {
		keyword,
		inlineTerm,
		operands,
		modifiers: projectModifiers(node, ctx, result),
		result,
	}
}
