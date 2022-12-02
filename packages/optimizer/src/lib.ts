import glob from 'glob'
import { readFileSync, writeFileSync } from 'fs'
import yaml from 'yaml'

import Engine, { reduceAST } from 'publicodes'

import type { RawPublicodes, RuleNode, ASTNode, Context } from 'publicodes'

export type RuleName = string
export type ParsedRules = Record<RuleName, RuleNode<RuleName>>
export type RawRules = RawPublicodes<RuleName>

type RefMap = Map<
	RuleName,
	// NOTE: It's an array but it's built from a Set, so no duplication
	RuleName[]
>

type RefMaps = {
	parents: RefMap
	childs: RefMap
}

// Removes references to:
// - $SITUATION rules
// - parent namespaces
function removeParentReferences(
	parsedRules: ParsedRules,
	[dottedName, set]: [RuleName, Set<RuleName>]
): [RuleName, RuleName[]] {
	const splittedDottedName = dottedName.split(' . ')
	//
	// splittedDottedName
	// 	.slice(1, splittedDottedName.length)
	// 	.reduce((accName, name) => {
	// 		const newAccName = accName + ' . ' + name
	// 		set.delete(accName)
	// 		return newAccName
	// 	}, splittedDottedName[0])

	const isChild = (dottedNameChild: RuleName) => {
		return (
			splittedDottedName[0] === dottedNameChild.split(' . ')[0] &&
			dottedNameChild.length >= dottedName.length
		)
	}

	return [
		dottedName,
		Array.from(set).filter((dottedName: string) => {
			return (
				parsedRules[dottedName] &&
				!dottedName.endsWith('$SITUATION') &&
				!isChild(dottedName)
			)
		}),
	]
}

function getReferences(
	context: Context<RuleName>,
	parsedRules: ParsedRules
): RefMaps {
	const getFilteredReferences = (
		referencesMap: Map<RuleName, Set<RuleName>>
	) => {
		return new Map(
			Array.from(referencesMap)
				.filter(
					([dottedName, _]) =>
						parsedRules[dottedName] && !dottedName.endsWith('$SITUATION')
				)
				.map((r: [RuleName, Set<RuleName>]) =>
					removeParentReferences(parsedRules, r)
				)
		)
	}
	// console.log(
	// 	'context.referencesMaps.rulesThatUse:',
	// 	context.referencesMaps.rulesThatUse
	// )
	return {
		parents: getFilteredReferences(context.referencesMaps.rulesThatUse),
		childs: getFilteredReferences(context.referencesMaps.referencesIn),
	}
}

export function getRawNodes(parsedRules: ParsedRules): RawRules {
	return Object.fromEntries(
		Object.values(parsedRules).reduce((acc, rule: RuleNode<RuleName>) => {
			const { nom, ...rawNode } = rule.rawNode
			acc.push([nom, rawNode])
			return acc
		}, [])
	)
}

// To be fold, a rule needs to be a constant:
// - no question
// - no dependency
function isFoldable(rule: RuleNode): boolean {
	const rawNode = rule.rawNode
	return !(rawNode.question || rawNode['par défaut'])
}

function isInParsedRules(parsedRules: ParsedRules, rule: RuleName): boolean {
	return Object.keys(parsedRules).includes(rule)
}

function isEmptyRule(rule: RuleNode): boolean {
	// There is always a 'nom' attribute.
	return Object.keys(rule.rawNode).length <= 1
}

function lexicalSubstitutionOfRefValue(
	parent: RuleNode,
	constant: RuleNode
): RuleNode {
	const refName = reduceAST(
		(_, node: ASTNode) => {
			if (
				node.nodeKind === 'reference' &&
				node.dottedName === constant.dottedName
			) {
				return node.name
			}
		},
		undefined,
		parent
	)

	parent.rawNode.formule = parent.rawNode.formule.replaceAll(
		refName,
		constant.rawNode.valeur
	)
	return parent
}

// Replaces all references in [refs] (could be childs or parents) of [ruleName]
// by its [rule.valeur].
function searchAndReplaceConstantValueInRefs(
	rule: RuleNode,
	parsedRules: ParsedRules,
	refs: RuleName[]
) {
	if (refs) {
		refs
			.map((dottedName) => parsedRules[dottedName])
			.filter((r) => r)
			.forEach(({ dottedName }) => {
				parsedRules[dottedName] = lexicalSubstitutionOfRefValue(
					parsedRules[dottedName],
					rule
				)
				parsedRules[dottedName].rawNode['est compressée'] = true
			})
	}
}

function searchAndReplaceConstantValueInChildRefs(
	rule: RuleNode,
	parsedRules: ParsedRules,
	refs: RuleName[]
) {
	if (refs) {
		refs
			.map((dottedName) => parsedRules[dottedName])
			.filter((r) => r)
			.forEach(({ dottedName }) => {
				console.log('parsedRules:', parsedRules[dottedName])

				// TODO: the child rules must have been compressed before substitution

				parsedRules[dottedName] = lexicalSubstitutionOfRefValue(
					rule,
					parsedRules[dottedName]
				)
				parsedRules[dottedName].rawNode['est compressée'] = true
			})
	}
}

export function constantFolding(engine): ParsedRules {
	const context: Context<RuleName> = engine.context
	const parsedRules: ParsedRules = engine.getParsedRules()
	const refs: RefMaps = getReferences(context, parsedRules)

	// console.log('refs:', refs)

	Object.entries(parsedRules)
		.filter(([_, rule]) => isFoldable(rule))

		// TODO: need to sort rules in order to go bottom up.
		// Topological sorting: https://en.wikipedia.org/wiki/Topological_sorting ?
		.forEach(([ruleName, rule]) => {
			if (!isInParsedRules(parsedRules, ruleName)) {
				// The [ruleName] rule has already been removed from the [parsedRules]
				return
			}
			if (isEmptyRule(rule)) {
				delete parsedRules[ruleName]
				return
			}

			// Constant leaf -> search and replace the constant in all its parents.
			if (rule.rawNode.valeur) {
				searchAndReplaceConstantValueInRefs(
					rule,
					parsedRules,
					refs.parents.get(ruleName)
				)
				console.log('2 delete:', ruleName)
				return delete parsedRules[ruleName]
			}

			// Potential leaf -> try to evaluate the formula at compile time.
			if (rule.rawNode.formule) {
				const { nodeValue, missingVariables, traversedVariables } =
					engine.evaluateNode(rule)

				// The computation could be done a compile time.
				if (Object.keys(missingVariables).length === 0) {
					parsedRules[ruleName].rawNode.valeur = nodeValue
					parsedRules[ruleName].rawNode['est compressée'] = true
					delete parsedRules[ruleName].rawNode.formule

					// Update ref counting
					traversedVariables.forEach((childRuleDottedName: RuleName) => {
						console.log(
							'parents of',
							childRuleDottedName,
							':',
							refs.parents.get(childRuleDottedName)
						)
						refs.parents.set(
							childRuleDottedName,
							refs.parents
								.get(childRuleDottedName)
								.filter(
									(dottedName) =>
										isInParsedRules(parsedRules, dottedName) &&
										dottedName !== ruleName
								)
						)
						if (refs.parents.get(childRuleDottedName).length === 0) {
							console.log('3 delete:', childRuleDottedName)
							delete parsedRules[childRuleDottedName]
							refs.parents.delete(childRuleDottedName)
						}
					})
				}
				// Try to replace internal ref
				else {
					const childs = refs.childs.get(ruleName)

					if (childs.length > 0) {
						console.log('ruleName', ruleName)
						searchAndReplaceConstantValueInChildRefs(rule, parsedRules, childs)
						console.log('afterrepalce:', parsedRules[ruleName])
						// TODO: Update ref counting
					}
				}
			}
		})

	return parsedRules
}

function readYAML(path: string): object {
	return yaml.parse(readFileSync(path, 'utf-8'))
}

export function getJSONRules(sourcePath: string, ignore?: string[]): object {
	const files = glob.sync(sourcePath, { ignore })
	const baseRules = files.reduce((acc: object, filename: string) => {
		try {
			const rules = readYAML(filename)
			return { ...acc, ...rules }
		} catch (err) {
			process.stderr.write(
				`An error occured while reading the file '${filename}':\n\n${err.message}`
			)
		}
	}, {})

	return baseRules
}
