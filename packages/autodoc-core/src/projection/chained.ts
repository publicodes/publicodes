import type * as Ast from '../ast'
import type { TraceValue } from '../trace'
import { getContextMechanism } from '../node-accessors'
import type { Ctx, ModifierView, ValueView } from './types'
import { projectOperand } from './operand'
import { lookupValue, unitOf } from './value'

const KEYWORDS = {
	default: 'par défaut',
	ceiling: 'plafond',
	floor: 'plancher',
	round_up: 'arrondi au supérieur',
	round_down: 'arrondi à l’inférieur',
	round_nearest: 'arrondi',
	applicable_if: 'applicable si',
	not_applicable_if: 'non applicable si',
} as const

type ModifierKind = keyof typeof KEYWORDS

/**
 * Modifiers change a value rather than compose one, so they hang under the value
 * they change, keyword first, marked taken effect or not.
 */
export function projectModifiers(
	node: Ast.ChainedValue,
	ctx: Ctx,
	result: ValueView,
): ModifierView[] {
	const modifiers: ModifierView[] = []
	for (const mechanism of node.chained_mechanisms) {
		switch (mechanism.kind) {
			case 'default':
			case 'ceiling':
			case 'floor':
			case 'round_up':
			case 'round_down':
			case 'round_nearest':
			case 'applicable_if':
			case 'not_applicable_if': {
				// What the modifier applies is written — a condition, a ceiling, an
				// arrondi — so its row shows the author's text, the trace's value
				// when there is one, and opens onto the argument's computation.
				const argument = projectOperand(
					mechanism.parameters,
					ctx,
					null,
					KEYWORDS[mechanism.kind],
				)
				const applied = decided(mechanism.kind, argument.value, result)
				modifiers.push({
					keyword: KEYWORDS[mechanism.kind],
					applied,
					inert: !applied,
					condition: { ...argument, applied, inert: !applied },
				})
				break
			}
			case 'context':
			case 'type_def':
				break
			default:
				mechanism satisfies never
		}
	}
	return modifiers
}

/**
 * Whether the modifier decided the value it hangs under. `applicable si` decides
 * the answer either way; `non applicable si` only when its condition is not
 * false; `par défaut` and the caps are the ones in force when the result is
 * theirs; an arrondi is part of the computation, not a term that may do nothing.
 */
function decided(kind: ModifierKind, argument: ValueView, result: ValueView): boolean {
	switch (kind) {
		case 'applicable_if':
		case 'round_up':
		case 'round_down':
		case 'round_nearest':
			return true
		case 'not_applicable_if':
			return argument.value !== false
		default:
			return (
				argument.state === 'value' &&
				result.state === 'value' &&
				argument.text === result.text
			)
	}
}

/**
 * What a `contexte` mechanism binds: values given to named rules for the nodes
 * under it, which the reader sees as supplied. Not modelled: the stack the
 * engine evaluated those nodes under, so their own traced values are still read
 * at the caller's stack.
 */
export function contextInside(node: Ast.ChainedValue, ctx: Ctx): Ctx {
	const context = getContextMechanism(node)
	if (context === undefined) return ctx
	const bound: Record<string, TraceValue> = { ...ctx.context }
	for (const [address, value] of Object.entries(context.parameters)) {
		const given = lookupValue(
			ctx,
			value.value_mechanism.id,
			value.value_mechanism.type,
			unitOf(value.value_mechanism),
		)
		if (given.value !== null) bound[address] = given.value
	}
	return { ...ctx, context: bound }
}
