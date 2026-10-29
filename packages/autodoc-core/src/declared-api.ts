/**
 * The model's declared API, as the compiled module states it: its outputs, and the
 * parameters those outputs transitively need. The module carries one entry per rule of
 * that API, with the author's own `title` where they wrote one — so an index and the
 * relations between results and parameters are read from it, and never walked out of
 * the AST.
 */

import type { RelatedRuleView } from './projection/types'
import { capitalizeFirst, leafName } from './projection/names'
import type { Trace, TraceValue } from './trace'

/** One rule of the declared API, as the compiled module exports it. */
export interface CompiledRule {
	/** The author's title, when they wrote one. */
	title?: string
	description?: string
	type?: string
	unit?: string
	/** The parameters its computation transitively needs. */
	params?: readonly string[]
	evaluate?: (
		params?: Record<string, TraceValue>,
		options?: { trace?: boolean },
	) => {
		value: unknown
		trace: Trace
		needed: string[]
		missing: string[]
	}
}

/** The compiled module's `outputs` or `parameters` export. */
export type CompiledRules = Record<string, CompiledRule>

/**
 * The compiled module as a namespace import: every rule of the declared API, and the
 * two exports that name its outputs and its parameters.
 */
export interface CompiledModule {
	default: CompiledRules
	outputs: CompiledRules
	parameters: CompiledRules
}

/** Names alone, for a host that has no compiled module to read. */
export type NameSource = CompiledRules | readonly string[]

const isList = (source: NameSource): source is readonly string[] =>
	Array.isArray(source)

export const namesOf = (source: NameSource): string[] =>
	isList(source) ? [...source] : Object.keys(source)

const entryOf = (source: NameSource, rule: string): CompiledRule | undefined =>
	isList(source) ? undefined : source[rule]

/**
 * The name a rule reads as in an index: the author's title, else the last segment of
 * its address. The same answer `displayName` gives from the AST.
 */
export const nameOf = (rule: string, source: NameSource): string =>
	capitalizeFirst(entryOf(source, rule)?.title ?? leafName(rule))

/**
 * The results whose computation needs this rule. A result is never among them: the
 * module lists parameters in `params`, and only parameters — so this is empty for
 * every output, and the block a parameter gets is exactly the one a result does not.
 */
export function usedForComputation(
	outputs: NameSource,
	rule: string,
): RelatedRuleView[] {
	return namesOf(outputs)
		.filter((name) => entryOf(outputs, name)?.params?.includes(rule))
		.map((address) => ({ address, name: nameOf(address, outputs) }))
}
