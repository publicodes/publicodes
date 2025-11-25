/**
 * Defines the layout of a form, i.e. how the questions should be presented to
 * the user.
 *
 * @template RuleName - The type representing the names of the rules in the
 * form.
 *
 * TODO: we should allow to extends this type with custom layouts from the
 * consumer side.
 */
export type FormLayout<RuleName extends string = string> =
	| SimpleLayout<RuleName>
	| TableLayout<RuleName>

export interface SimpleLayout<RuleName extends string> {
	type: 'simple'
	rule: RuleName
}

export function simpleLayout<RuleName extends string>(
	rule: RuleName,
): SimpleLayout<RuleName> {
	return { type: 'simple', rule }
}

export interface TableLayout<RuleName extends string> {
	type: 'table'
	title: string
	headers: string[]
	rows: RuleName[][]
}

export function tableLayout<RuleName extends string>(
	title: string,
	headers: string[],
	rows: RuleName[][],
): TableLayout<RuleName> {
	return { type: 'table', title, headers, rows }
}
