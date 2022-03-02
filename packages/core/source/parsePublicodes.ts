import yaml from 'yaml'
import { ParsedRules, Logger, ASTNode } from '.'
import { makeASTTransformer, traverseParsedRules } from './AST'
import parse from './parse'
import { getReplacements, inlineReplacements } from './replacement'
import { Rule, RuleNode } from './rule'
import { disambiguateRuleReference } from './ruleUtils'
import { getUnitKey } from './units'

export type Context = {
	dottedName: string
	parsedRules: Record<string, RuleNode>
	ruleTitle?: string
	getUnitKey?: getUnitKey
	logger: Logger
	circularReferences?: boolean
}

// TODO: Currently only handle nullability, but the infering logic should be
// extended to support the full unit type system.
export type InferedUnit = { isNullable: boolean }

type RawRule = Omit<Rule, 'nom'> | string | number
export type RawPublicodes = Record<string, RawRule>

export default function parsePublicodes<RuleNames extends string>(
	rawRules: RawPublicodes | string,
	partialContext: Partial<Context> = {}
): {
	parsedRules: ParsedRules<RuleNames>
	ruleUnits: WeakMap<ASTNode, InferedUnit>
	rulesDependencies: Record<RuleNames, Array<RuleNames>>
} {
	// STEP 1: parse Yaml
	let rules =
		typeof rawRules === 'string'
			? (yaml.parse(('' + rawRules).replace(/\t/g, '  ')) as RawPublicodes)
			: { ...rawRules }

	// STEP 2: transpile [ref] writing
	rules = transpileRef(rules)

	// STEP 3: Rules parsing
	const context: Context = {
		dottedName: partialContext.dottedName ?? '',
		parsedRules: partialContext.parsedRules ?? {},
		logger: partialContext.logger ?? console,
		getUnitKey: partialContext.getUnitKey ?? ((x) => x),
		circularReferences: false,
	}
	Object.entries(rules).forEach(([dottedName, rule]) => {
		if (typeof rule === 'string' || typeof rule === 'number') {
			rule = {
				formule: `${rule}`,
			}
		}
		if (typeof rule !== 'object') {
			throw new SyntaxError(
				`Rule ${dottedName} is incorrectly written. Please give it a proper value.`
			)
		}
		parse({ nom: dottedName, ...rule }, context)
	})
	let parsedRules = context.parsedRules

	// STEP 4: Disambiguate reference
	const rulesDependencies = {}
	parsedRules = traverseParsedRules(
		disambiguateReference(parsedRules, rulesDependencies),
		parsedRules
	)

	// STEP 5: Inline replacements
	const replacements = getReplacements(parsedRules)
	parsedRules = traverseParsedRules(
		inlineReplacements(replacements, context.logger),
		parsedRules
	)

	// STEP 6: type inference
	const ruleUnits = inferRulesUnit(parsedRules, rulesDependencies)

	return { parsedRules, ruleUnits, rulesDependencies } as any
}

// We recursively traverse the YAML tree in order to transform named parameters
// into rules.
function transpileRef(object: Record<string, any> | string | Array<any>) {
	if (Array.isArray(object)) {
		return object.map(transpileRef)
	}
	if (!object || typeof object !== 'object') {
		return object
	}
	return Object.entries(object).reduce((obj, [key, value]) => {
		const match = /\[ref( (.+))?\]$/.exec(key)

		if (!match) {
			return { ...obj, [key]: transpileRef(value) }
		}

		const argumentType = key.replace(match[0], '').trim()
		const argumentName = match[2]?.trim() || argumentType

		return {
			...obj,
			[argumentType]: {
				nom: argumentName,
				valeur: transpileRef(value),
			},
		}
	}, {})
}

export const disambiguateReference = (
	parsedRules: Record<string, RuleNode>,
	dependencies: Record<string, Array<string>>
) =>
	makeASTTransformer((node) => {
		if (node.nodeKind === 'reference') {
			const dottedName = disambiguateRuleReference(
				parsedRules,
				node.contextDottedName,
				node.name
			)

			if (node.circularReference !== true) {
				dependencies[node.contextDottedName] = [
					...(dependencies[node.contextDottedName] ?? []),
					dottedName,
				]
			}

			return {
				...node,
				dottedName,
				title: parsedRules[dottedName].title,
				acronym: parsedRules[dottedName].rawNode.acronyme,
			}
		}
	})

// Standard topological sort algorithm
function topologicalSort<Names extends string>(
	rulesNames: Array<Names>,
	dependencyGraph: Record<Names, Array<Names>>
) {
	const result: Array<Names> = []
	const temp: Partial<Record<Names, Boolean>> = {}

	for (const ruleName of rulesNames) {
		if (!result.includes(ruleName)) {
			topologicalSortHelper(ruleName)
		}
	}

	function topologicalSortHelper(ruleName) {
		temp[ruleName] = true
		const nodeDependencies = dependencyGraph[ruleName] ?? []
		for (const dependency of nodeDependencies) {
			if (temp[dependency]) {
				// TODO: We could throw an error on a cycle but some tests are expecting
				// cycles to compile and to detect them at a letter stage with a
				// function taking the parsed rules as an input
				//
				// throw new Error( `Cycle detected in the graph. The node ${dependency}
				//  depends on ${ruleName}`
				// )
				continue
			}
			if (!result.includes(dependency)) {
				topologicalSortHelper(dependency)
			}
		}
		temp[ruleName] = false
		result.push(ruleName)
	}

	return result
}

function inferRulesUnit(parsedRules, rulesDependencies) {
	// topological sort rules
	// Throws an error if there is a cycle in the graph
	const topologicalOrder = topologicalSort(
		Object.keys(parsedRules),
		rulesDependencies
	)

	const cache = new WeakMap<ASTNode, InferedUnit>()
	topologicalOrder.forEach((ruleName) => {
		inferNodeUnitAndCache(parsedRules[ruleName])
	})
	topologicalOrder.forEach((ruleName) => {
		if (parsedRules[ruleName].nodeKind === 'rule') {
			parsedRules[ruleName].explanation.parents
				// .filter(
				// 	(parent) =>
				// 		rulesDependencies[parent.dottedName]?.includes(ruleName) !== true
				// )
				.forEach((parent) => {
					inferNodeUnitAndCache(parent)
				})
		}
	})

	function inferNodeUnitAndCache(node: ASTNode): InferedUnit {
		if (cache.has(node)) {
			return cache.get(node)!
		}
		const unit = inferNodeUnit(node)
		cache.set(node, unit)
		return unit
	}

	function inferNodeUnit(node: ASTNode): InferedUnit {
		switch (node.nodeKind) {
			case 'somme':
			case 'produit':
			case 'barème':
			case 'durée':
			case 'grille':
			case 'taux progressif':
			case 'maximum':
			case 'minimum':
				return { isNullable: false }

			case 'applicable si':
			case 'non applicable si':
				return { isNullable: true }

			case 'toutes ces conditions':
			case 'une de ces conditions':
				return { isNullable: true }

			case 'constant':
				return {
					isNullable:
						node.nodeValue === null || typeof node.nodeValue === 'boolean',
				}

			case 'operation':
				return {
					isNullable: ['<', '<=', '>', '>=', '=', '!='].includes(
						node.operationKind
					),
				}

			case 'inversion':
			case 'recalcul':
			case 'replacementRule':
			case 'une possibilité':
			case 'résoudre référence circulaire':
			case 'synchronisation':
			case 'texte':
				return { isNullable: false }

			case 'abattement':
				return inferNodeUnitAndCache(node.explanation.assiette)

			case 'arrondi':
			case 'nom dans la situation':
			case 'plafond':
			case 'plancher':
			case 'rule':
				return inferNodeUnitAndCache(node.explanation.valeur)

			case 'unité':
				return inferNodeUnitAndCache(node.explanation)

			case 'variations':
				return {
					isNullable: node.explanation.some((line) => {
						// TODO: hack for mon-entreprise rules, because topologicalSort
						// seems imperfect
						if (inferNodeUnitAndCache(line.consequence) === undefined) {
							return false
						}
						return inferNodeUnitAndCache(line.consequence).isNullable
					}),
				}

			case 'par défaut':
				return {
					isNullable:
						inferNodeUnitAndCache(node.explanation.parDéfaut).isNullable ||
						inferNodeUnitAndCache(node.explanation.valeur).isNullable,
				}

			case 'reference':
				return cache.get(parsedRules[node.dottedName as string])!
		}
	}

	return cache
}
