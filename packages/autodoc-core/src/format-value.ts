import { NotApplicable, NotDefined, TraceValue } from './trace'

export type FormatType =
	| { type: 'number'; unit?: string }
	| { type: 'text' }
	| { type: 'boolean' }
	| { type: 'date' }

// construire un formateur coûte ~15 µs, le réutiliser 0,3 : une page en formate des
// dizaines de milliers, la projection lit toute l'expression pour en garder quelques lignes
const NUMBERS = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const DATES = new Intl.DateTimeFormat('fr-FR')

function formatNumber(value: number, unit?: string): string {
	const formatted = NUMBERS.format(value)

	return unit ? `${formatted} ${unit}` : formatted
}

/**
 * A node the compiler left untyped reads as text, and text can hold anything: a figure
 * keeps its figure's writing, a date its date's, rather than the string of a value the
 * reader would have to parse.
 */
function formatText(value: unknown): string {
	if (typeof value === 'number') return formatNumber(value)
	if (typeof value === 'boolean') return formatBoolean(value)
	if (value instanceof Date) return formatDate(value)
	return String(value)
}

function formatBoolean(value: boolean): string {
	return value ? 'oui' : 'non'
}

function formatDate(value: string | Date): string {
	const date = typeof value === 'string' ? new Date(value) : value
	return DATES.format(date)
}

export function formatValue(
	value: TraceValue | undefined,
	spec: FormatType,
): string {
	if (value === NotDefined) {
		return 'non défini'
	}
	if (value === NotApplicable) {
		return '-'
	}

	// le type de la valeur et celui de la règle viennent du même modèle : quand ils se
	// contredisent, c'est la valeur qui a raison, et elle se lit dans son écriture
	switch (spec.type) {
		case 'number':
			return typeof value === 'number' ?
					formatNumber(value, spec.unit)
				:	formatText(value)
		case 'text':
			return formatText(value)
		case 'boolean':
			return typeof value === 'boolean' ?
					formatBoolean(value)
				:	formatText(value)
		case 'date':
			return value instanceof Date || typeof value === 'string' ?
					formatDate(value)
				:	formatText(value)
	}
}
