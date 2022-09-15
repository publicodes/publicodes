import { ParsedRules } from '.'
import { ASTNode } from './AST/types'
import { PublicodesError } from './error'
import { ReferencesMaps } from './parsePublicodes'
import { ReferenceNode } from './reference'
import { RuleNode } from './rule'
import { addToMapSet } from './utils'

export { cyclicDependencies } from './AST/graph'

const splitName = (str: string) => str.split(' . ')
const joinName = (strs: Array<string>) => strs.join(' . ')

/**
 * Returns the last part of a dottedName (the leaf).
 */
export const nameLeaf = (dottedName: string) =>
	splitName(dottedName).slice(-1)?.[0]

/**
 * Encodes a dottedName for the URL to be secure.
 * @see {@link decodeRuleName}
 */
export const encodeRuleName = (dottedName: string): string =>
	dottedName
		?.replace(/\s\.\s/g, '/')
		.replace(/-/g, '\u2011') // replace with a insecable tiret to differenciate from space
		.replace(/\s/g, '-')

/**
 * Decodes an encoded dottedName.
 * @see {@link encodeRuleName}
 */
export const decodeRuleName = (dottedName: string): string =>
	dottedName
		.replace(/\//g, ' . ')
		.replace(/-/g, ' ')
		.replace(/\u2011/g, '-')

/**
 * Return dottedName from contextName
 */
export const contextNameToDottedName = (contextName: string) =>
	contextName.endsWith('$SITUATION') ? ruleParent(contextName) : contextName

/**
 * Returns the parent dottedName
 */
export const ruleParent = (dottedName: string): string =>
	joinName(splitName(dottedName).slice(0, -1))

/**
 * Returns an array of dottedName from near parent to far parent.
 */
export function ruleParents(dottedName: string): Array<string> {
	return splitName(dottedName)
		.slice(0, -1)
		.map((_, i, arr) => joinName(arr.slice(0, i + 1)))
		.reverse()
}

/**
 * Returns an array of all child rules of a dottedName
 */
export const getChildrenRules = (
	parsedRules: ParsedRules<string>,
	dottedName: string
) => {
	const childrenRules = Object.keys(parsedRules).filter(
		(ruleDottedName) =>
			ruleDottedName.startsWith(dottedName) &&
			splitName(ruleDottedName).length === splitName(dottedName).length + 1
	)

	return childrenRules
}

/**
 * Finds the common ancestor of two dottedName
 */
export function findCommonAncestor(dottedName1: string, dottedName2: string) {
	const splitDottedName1 = splitName(dottedName1)
	const splitDottedName2 = splitName(dottedName2)
	const index = splitDottedName1.findIndex(
		(value, i) => splitDottedName2[i] !== value
	)

	return index === -1 ? dottedName1 : joinName(splitDottedName1.slice(0, index))
}

/**
 * Check wether a rule is accessible from a namespace.
 *
 * Takes into account that some namespace can be `private`, i.e. that they can only be
 * accessed by immediate parent, children or siblings.
 *
 * @param rules The parsed rules
 * @param contextName The context of the call
 * @param name The namespace checked for accessibility
 */
export function isAccessible(
	rules: Record<string, RuleNode>,
	contextName: string,
	name: string
) {
	if (!(name in rules)) {
		throw new PublicodesError(
			'InternalError',
			`La règle "${name}" n'existe pas`,
			{ dottedName: name }
		)
	}

	const commonAncestor = findCommonAncestor(contextName, name)
	const parents = [name, ...ruleParents(name), '']
	const rulesToCheckForPrivacy = parents.slice(
		0,
		Math.max(parents.indexOf(commonAncestor) - 1, 0)
	)

	return rulesToCheckForPrivacy.every(
		(dottedName) =>
			!(dottedName in rules) || rules[dottedName].private === false
	)
}

/**
 * Check wether a rule is tagged as experimental.
 *
 * Takes into account the a children of an experimental rule is also experimental
 *
 * @param rules The parsed rules
 * @param name The namespace checked for experimental
 */
export function isExperimental(rules: Record<string, RuleNode>, name: string) {
	if (!(name in rules)) {
		throw new PublicodesError(
			'InternalError',
			`La règle "${name}" n'existe pas`,
			{ dottedName: name }
		)
	}
	const parents = [name, ...ruleParents(name)]
	return parents.some(
		(dottedName) =>
			dottedName in rules && rules[dottedName].rawNode?.experimental === 'oui'
	)
}

export function disambiguateReference<R extends Record<string, RuleNode>>(
	rules: R,
	contextName = '',
	partialName: string
): keyof R {
	const possibleDottedName = [contextName, ...ruleParents(contextName), '']
		.map((x) => (x ? x + ' . ' + partialName : partialName))
		// Rules can reference themselves, but it should be the last thing to check
		.sort((a, b) => (a === contextName ? 1 : b === contextName ? -1 : 0))

	const existingDottedName = possibleDottedName.filter((name) => name in rules)
	const accessibleDottedName = existingDottedName.find((name) =>
		isAccessible(rules, contextName, name)
	)

	if (!existingDottedName.length) {
		throw new PublicodesError(
			'SyntaxError',
			`La référence "${partialName}" est introuvable.
Vérifiez que l'orthographe et l'espace de nom sont corrects`,
			{ dottedName: contextNameToDottedName(contextName) }
		)
	}
	if (!accessibleDottedName) {
		throw new PublicodesError(
			'SyntaxError',
			`La règle "${existingDottedName[0]}" n'est pas accessible depuis "${contextName}".
Cela vient du fait qu'elle est privée ou qu'un de ses parent est privé`,
			{ dottedName: contextNameToDottedName(contextName) }
		)
	}

	return accessibleDottedName
}

export function ruleWithDedicatedDocumentationPage(rule) {
	return (
		rule.virtualRule !== true &&
		rule.type !== 'groupe' &&
		rule.type !== 'texte' &&
		rule.type !== 'paragraphe' &&
		rule.type !== 'notification'
	)
}

export function updateReferencesMapsFromReferenceNode(
	node: ASTNode,
	referencesMaps: ReferencesMaps<string>,
	ruleDottedName?: string
) {
	if (node.nodeKind === 'reference') {
		addToMapSet(
			referencesMaps.referencesIn,
			ruleDottedName ?? node.contextDottedName,
			node.dottedName
		)
		addToMapSet(
			referencesMaps.rulesThatUse,
			node.dottedName,
			ruleDottedName ?? node.contextDottedName
		)
	}
}
export function disambiguateReferenceNode(
	node: ASTNode,
	parsedRules: ParsedRules<string>
): ReferenceNode | undefined {
	if (node.nodeKind !== 'reference') {
		return
	}
	if (node.dottedName) {
		return node
	}

	node.dottedName = disambiguateReference(
		parsedRules,
		node.contextDottedName,
		node.name
	)
	node.title = parsedRules[node.dottedName].title
	node.acronym = parsedRules[node.dottedName].rawNode.acronyme
	return node
}
