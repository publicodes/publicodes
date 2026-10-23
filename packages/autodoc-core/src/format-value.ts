import { NotApplicable, NotDefined, TraceValue } from './trace'

export type FormatType =
	| { type: 'number'; unit?: string }
	| { type: 'text' }
	| { type: 'boolean' }
	| { type: 'date' }

function formatNumber(value: number, unit?: string): string {
	const formatted = new Intl.NumberFormat('fr-FR', {
		maximumFractionDigits: 2,
	}).format(value)

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
	return date.toLocaleDateString('fr-FR')
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

	switch (spec.type) {
		case 'number':
			return formatNumber(value as number, spec.unit)
		case 'text':
			return formatText(value)
		case 'boolean':
			return formatBoolean(value as boolean)
		case 'date':
			return formatDate(value as Date)
	}
}
