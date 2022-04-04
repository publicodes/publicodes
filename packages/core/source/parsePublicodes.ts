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
export type InferedType = {
	isNullable: boolean
	type: 'string' | 'number' | 'boolean' | 'objet'
}

type RawRule = Omit<Rule, 'nom'> | string | number
export type RawPublicodes = Record<string, RawRule>

export default function parsePublicodes<RuleNames extends string>(
	rawRules: RawPublicodes | string,
	partialContext: Partial<Context> = {}
): {
	parsedRules: ParsedRules<RuleNames>
	ruleUnits: WeakMap<ASTNode, InferedType>
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

		// Some mechanisms works with circular references and avoid infinite loops
		// at runtime by having special handling for theses references, for instance
		// "résourde la référence circulaire" or branch desactivation implemented
		// with parent references at the rule level. When these mechanisms call
		// `parse` they expect a reference but the parse API will return a AST node
		// and can't guarantee that it will be a reference (this is not ideal, we
		// will probably want to rework this part).
		//
		// To automate tree traversal we mark these references as circular using the
		// parse context.
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
		disambiguateReferenceAndCollectDependencies(parsedRules, rulesDependencies),
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

export const disambiguateReferenceAndCollectDependencies = (
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

			if (!(node.circularReference ?? false)) {
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

	const cache = new WeakMap<ASTNode, InferedType>()
	topologicalOrder.forEach((ruleName) => {
		inferNodeUnitAndCache(parsedRules[ruleName])
	})
	topologicalOrder.forEach((ruleName) => {
		if (parsedRules[ruleName].nodeKind === 'rule') {
			parsedRules[ruleName].explanation.parents.forEach((parent) => {
				inferNodeUnitAndCache(parent)
			})
		}
	})

	function inferNodeUnitAndCache(node: ASTNode): InferedType {
		if (cache.has(node)) {
			return cache.get(node)!
		}
		const unit = inferNodeType(node)
		cache.set(node, unit)
		return unit
	}

	function inferNodeType(node: ASTNode): InferedType {
		switch (node.nodeKind) {
			case 'somme':
			case 'produit':
			case 'barème':
			case 'durée':
			case 'grille':
			case 'taux progressif':
			case 'maximum':
			case 'minimum':
				return { isNullable: false, type: 'number' }

			case 'applicable si':
			case 'non applicable si':
				return {
					isNullable: true,
					type: inferNodeType(node.explanation.valeur).type,
				}

			case 'toutes ces conditions':
			case 'une de ces conditions':
				return { isNullable: true, type: 'boolean' }

			case 'constant':
				return {
					isNullable:
						node.nodeValue === null || typeof node.nodeValue === 'boolean',
					type: node.type,
				}

			case 'operation':
				return {
					isNullable: ['<', '<=', '>', '>=', '=', '!='].includes(
						node.operationKind
					),
					type: ['<', '<=', '>', '>=', '=', '!='].includes(node.operationKind)
						? 'boolean'
						: 'number',
				}

			case 'inversion':
			case 'recalcul':
			case 'replacementRule':
			case 'une possibilité':
			case 'résoudre référence circulaire':
			case 'synchronisation':
				// TODO: Synchronisation can also be used for texts. This doens't have
				// any runtime consequence currently because the only type we only
				// really care about is boolean for branch disabling.
				return { isNullable: false, type: 'number' }

			case 'texte':
				return { isNullable: false, type: 'string' }

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
				// With "rend non applicable" we have a "consequence: null" line in our
				// variation which can't be used to determine its type. So we need to
				// find the first consequence with a non-null value.
				const firstNonNullConsequence = node.explanation.find(
					({ consequence }) => (consequence as any).nodeValue !== null
				)?.consequence
				return {
					isNullable: node.explanation.some((line) => {
						// TODO: hack for mon-entreprise rules, because topologicalSort
						// seems imperfect
						if (
							line.consequence === undefined ||
							inferNodeUnitAndCache(line.consequence) === undefined
						) {
							return false
						}
						return (
							line.consequence &&
							inferNodeUnitAndCache(line.consequence).isNullable
						)
					}),
					type:
						(firstNonNullConsequence &&
							inferNodeUnitAndCache(firstNonNullConsequence)?.type) ??
						'number',
				}

			case 'par défaut':
				return {
					isNullable:
						inferNodeUnitAndCache(node.explanation.parDéfaut).isNullable ||
						inferNodeUnitAndCache(node.explanation.valeur).isNullable,
					type: inferNodeUnitAndCache(node.explanation.parDéfaut).type,
				}

			case 'reference':
				return cache.get(parsedRules[node.dottedName as string])!
		}
	}

	return cache
}

// To calculate the “missing variables” of an expression we need to determine
// the static subset of the rules that are expected in the situation. Theses
// rules are :
// - the rules without formulas
// - the rules with a default formula
// - the rules with a “fake formula” of "une possibilité"
//
// TODO: Simplify this logic. It isn't well thought but is mostly a product of
// historical evolutions.
export function getVariablesExpectedInSituation<N extends string>(
	parsedRules: ParsedRules<N>
): Array<N> {
	return Object.entries<RuleNode>(parsedRules)
		.filter(([, { rawNode }]) => {
			return (
				([
					'formule',
					'valeur',
					'somme',
					'produit',
					'barème',
					'grille',
					'variations',
					'une de ces conditions',
					'toutes ces conditions',
				].every((mecanismName) => !(mecanismName in rawNode)) &&
					rawNode.type !== 'texte') ||
				(typeof rawNode.formule === 'object' &&
					'une possibilité' in rawNode.formule)
			)
		})
		.map(([dottedName]) => dottedName as N)
}
