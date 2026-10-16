import type * as Ast from '../ast'

/**
 * The word a mechanism goes by when a line has no written form to show. A sum or a
 * product is written by its own operators; a variations, a list or a bound has no
 * operator of its own, so a collapsed line names the mechanism rather than leaving
 * the reader with a bare figure.
 */
export const MECHANISM_NAMES = {
	all_of: 'toutes ces conditions',
	one_of: 'une de ces conditions',
	min_of: 'le plus petit de',
	max_of: 'le plus grand de',
	average: 'moyenne',
	variations: 'variations',
} as const

/** The word, or null where the mechanism writes itself with operators. */
export function mechanismName(mechanism: Ast.ValueMechanism): string | null {
	switch (mechanism.kind) {
		case 'all_of':
			return MECHANISM_NAMES.all_of
		case 'one_of':
			return MECHANISM_NAMES.one_of
		case 'min_of':
			return MECHANISM_NAMES.min_of
		case 'max_of':
			return MECHANISM_NAMES.max_of
		case 'average':
			return MECHANISM_NAMES.average
		case 'variations':
			return MECHANISM_NAMES.variations
		case 'expr':
		case 'value':
		case 'is_applicable':
		case 'is_not_applicable':
		case 'is_defined':
		case 'is_not_defined':
		case 'sum':
		case 'product':
		case 'not_defined':
			return null
		default:
			return mechanism satisfies never
	}
}
