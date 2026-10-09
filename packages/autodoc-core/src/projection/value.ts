import { formatValue, type FormatType } from '../format-value'
import type { TraceValue } from '../trace'
import { NotApplicable, NotDefined } from '../trace'
import type { Ctx, ValueView } from './types'

export const ABSENT: ValueView = { state: 'absent', value: null, text: null }

export const textOf = (value: ValueView): string | null =>
	value.state === 'absent' ? null : value.text

/** `unit` only exists on the number member of the type union. */
export const unitOf = (node: {
	type: string
	unit?: string
}): string | undefined => (node.type === 'number' ? node.unit : undefined)

const formatTypeOf = (type: string, unit?: string): FormatType => {
	if (type === 'number') return { type: 'number', unit }
	if (type === 'boolean' || type === 'date') return { type }
	return { type: 'text' }
}

export const formatSupplied = (
	value: TraceValue,
	type: string,
	unit?: string,
): string => formatValue(value, formatTypeOf(type, unit))

/**
 * The value the evaluation left at a node, read from the trace at the node's
 * own id and the current context stack. Never computed, only read.
 */
export function lookupValue(
	ctx: Ctx,
	id: string,
	type: string,
	unit?: string,
): ValueView {
	const byStack = ctx.trace?.[id]
	if (!byStack) return ABSENT
	const value = byStack[ctx.contextStackId]
	if (value === undefined) return ABSENT
	if (value === NotDefined) return { state: 'not_defined', value, text: 'non défini' }
	if (value === NotApplicable)
		return { state: 'not_applicable', value, text: 'non applicable' }
	return { state: 'value', value, text: formatValue(value, formatTypeOf(type, unit)) }
}
