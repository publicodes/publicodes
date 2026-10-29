import type * as Ast from '../../ast'
import type { Ctx, MechanismView, OperandView, ValueView } from '../types'
import { projectModifiers } from '../chained'
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
/**
 * The expression a `-` negates, when the term is nothing else. In a sum, `- b` is a
 * subtraction: the minus is the line's operator, not a level to open under it, and the
 * inner expression keeps its own identity so the line reads and opens as `b` does.
 */
const negationOf = (node: Ast.ChainedValue): Ast.ChainedValue | null => {
	const mechanism = node.value_mechanism
	if (mechanism.kind !== 'expr' || mechanism.parameters.kind !== 'neg')
		return null
	if (node.chained_mechanisms.length > 0) return null
	const neg = mechanism.parameters
	const inner = neg.parameters
	// the negated expression's own id, so the line reads the value of what it names
	return {
		value_mechanism: {
			kind: 'expr',
			id: inner.id,
			type: neg.type,
			unit: unitOf(neg),
			position: neg.position,
			parameters: inner,
		},
		chained_mechanisms: [],
	}
}

/** The minus a subtraction reads with, as `binary-expression` writes it. */
const MINUS = '−'

/** Ce qu'un terme pèse dans sa somme, en valeur absolue : un terme sans valeur passe après. */
const magnitude = (node: Ast.ChainedValue, ctx: Ctx): number => {
	const { id, type } = node.value_mechanism
	const value = lookupValue(ctx, id, type, unitOf(node.value_mechanism)).value
	return typeof value === 'number' ? Math.abs(value) : Number.NEGATIVE_INFINITY
}

export function projectList(
	node: Ast.ChainedValue,
	mechanism: ListMechanism,
	ctx: Ctx,
	keyword: string,
	operator: string,
): MechanismView {
	const result = lookupValue(
		ctx,
		mechanism.id,
		mechanism.type,
		unitOf(mechanism),
	)

	// a sum of a negation is a subtraction: `- b` is `− b`, and nothing opens under it
	const terms = mechanism.parameters.map((operand) => {
		const negated = keyword === 'somme' ? negationOf(operand) : null
		return {
			node: negated ?? operand,
			sign: negated !== null ? MINUS : operator,
		}
	})
	// une somme se lit du plus gros poste au plus petit : c'est la valeur qui classe les
	// termes, et sans valeur à lire l'ordre de l'auteur reste le seul
	if (keyword === 'somme' && ctx.trace !== undefined) {
		terms.sort(
			(left, right) => magnitude(right.node, ctx) - magnitude(left.node, ctx),
		)
	}
	const signs: string[] = []
	const operands: OperandView[] = terms.map(({ node, sign }, index) => {
		const gutter = index === 0 ? null : sign
		signs.push(gutter === null ? '' : `${gutter} `)
		const view = projectOperand(node, ctx, gutter, null)
		const inert = hadNoEffect(keyword, view.value)
		return { ...view, inert }
	})

	const inlineTerm =
		operands.length === 0 ?
			null
		:	operands
				.map((operand, index) => {
					// a mechanism's own word is not a written form: the value stands for it.
					// sans valeur non plus, la place reste tenue : un opérateur sans second
					// terme se lit comme une troncature, pas comme un terme manquant
					const written = operand.termIsMechanism ? null : operand.label
					const text = written ?? textOf(operand.value) ?? '…'
					return `${signs[index]}${text}`
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
