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

function formatText(value: string): string {
	return value
}

function formatBoolean(value: boolean): string {
	return value ? 'oui' : 'non'
}

function formatDate(value: string | Date): string {
	const date = typeof value === 'string' ? new Date(value) : value
	return date.toLocaleDateString()
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
			return formatText(value as string)
		case 'boolean':
			return formatBoolean(value as boolean)
		case 'date':
			return formatDate(value as Date)
	}
}
