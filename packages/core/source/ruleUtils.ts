import { ParsedRules } from '.'
import { ASTNode } from './AST/types'
import { syntaxError } from './error'
import { ReferencesMaps } from './parsePublicodes'
import { ReferenceNode } from './reference'
import { RuleNode } from './rule'
import { addToMapSet } from './utils'

export { cyclicDependencies } from './AST/graph'

const splitName = (str: string) => str.split(' . ')
const joinName = (strs: Array<string>) => strs.join(' . ')

export const nameLeaf = (name: string) => splitName(name).slice(-1)?.[0]

export const encodeRuleName = (name: string): string =>
	name
		?.replace(/\s\.\s/g, '/')
		.replace(/-/g, '\u2011') // replace with a insecable tiret to differenciate from space
		.replace(/\s/g, '-')

export const decodeRuleName = (name: string): string =>
	name
		.replace(/\//g, ' . ')
		.replace(/-/g, ' ')
		.replace(/\u2011/g, '-')

export function ruleParent(dottedName: string): string {
	return joinName(splitName(dottedName).slice(0, -1))
}

export function ruleParents(dottedName: string): Array<string> {
	return splitName(dottedName)
		.slice(0, -1)
		.map((_, i, arr) => joinName(arr.slice(0, i + 1)))
		.reverse()
}

function findCommonAncestor(dottedName1: string, dottedName2: string) {
	const splitDottedName1 = dottedName1.split(' . ')
	const splitDottedName2 = dottedName2.split(' . ')
	const index = splitDottedName1.findIndex(
		(value, i) => splitDottedName2[i] !== value
	)
	if (index === -1) {
		return dottedName1
	}
	return splitDottedName1.slice(0, index).join(' . ')
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
		throw new Error("La règle n'existe pas")
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
		syntaxError(
			contextName,
			`La référence "${partialName}" est introuvable.
Vérifiez que l'orthographe et l'espace de nom sont corrects`
		)
		throw new Error()
	}
	if (!accessibleDottedName) {
		syntaxError(
			contextName,
			`La règle "${existingDottedName[0]}" n'est pas accessible depuis "${contextName}".
Cela vient du fait qu'elle est privée ou qu'un de ses parent est privé`
		)
		throw new Error()
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
