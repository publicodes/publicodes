import type * as Ast from '../ast'
/** A rule's name reads as a name: its first letter is a capital. */
export const capitalizeFirst = (name: string): string =>
	name.charAt(0).toLocaleUpperCase('fr-FR') + name.slice(1)

export const leafName = (dottedName: string): string => {
	const parts = dottedName.split(' . ')
	return parts[parts.length - 1]
}

/**
 * The author's title when they wrote one, otherwise the last segment of the
 * address. Never the relative path: the same rule is named the same way
 * wherever it appears.
 */
export const displayName = (
	ast: Ast.PublicodeAST,
	dottedName: string,
): string => capitalizeFirst(ast[dottedName]?.title ?? leafName(dottedName))
