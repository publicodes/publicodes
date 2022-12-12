import Engine, { reduceAST } from 'publicodes'

import type {
	RawPublicodes,
	RuleNode,
	ASTNode,
	Context,
	Rule,
} from 'publicodes'
import type { RuleName, ParsedRules } from './commons'

type RefMap = Map<
	RuleName,
	// NOTE: It's an array but it's built from a Set, so no duplication
	RuleName[] | undefined
>

type RefMaps = {
	parents: RefMap
	childs: RefMap
}

type FoldingCtx = {
	engine: Engine
	parsedRules: ParsedRules
	refs: RefMaps
}

function getReferences(
	context: Context<RuleName>,
	parsedRules: ParsedRules
): RefMaps {
	const getFilteredReferencesBy = (
		referencesMap: Map<RuleName, Set<RuleName>>,
		predicate: (
			dottedName: RuleName,
			dottedNameToCompareWith: RuleName
		) => boolean
	) => {
		return new Map(
			Array.from(referencesMap)
				.filter(
					([dottedName, _]) =>
						parsedRules[dottedName] && !dottedName.endsWith('$SITUATION')
				)
				.map(([dottedName, set]: [RuleName, Set<RuleName>]) => [
					dottedName,
					Array.from(set).filter((dottedNameToCompareWith: string) => {
						return (
							parsedRules[dottedNameToCompareWith] &&
							!dottedNameToCompareWith.endsWith('$SITUATION') &&
							predicate(dottedName, dottedNameToCompareWith)
						)
					}),
				])
		)
	}
	const isParent = (
		dottedName: RuleName,
		// Potential parent of [dottedName]
		dottedNameToCompareWith: RuleName
	) => {
		return (
			dottedName.startsWith(dottedNameToCompareWith) &&
			dottedNameToCompareWith.split(' . ').length <
				dottedName.split(' . ').length
		)
	}
	const isChild = (
		dottedName: RuleName,
		// Potential child of [dottedName]
		dottedNameToCompareWith: RuleName
	) => {
		return (
			dottedNameToCompareWith.startsWith(dottedName) &&
			dottedNameToCompareWith.split(' . ').length >
				dottedName.split(' . ').length
		)
	}
	return {
		parents: getFilteredReferencesBy(
			context.referencesMaps.rulesThatUse,
			(dottedName, dottedNameToCompareWith) =>
				!isChild(dottedName, dottedNameToCompareWith)
		),
		childs: getFilteredReferencesBy(
			context.referencesMaps.referencesIn,
			(dottedName, dottedNameToCompareWith) =>
				!isParent(dottedName, dottedNameToCompareWith)
		),
	}
}

// To be fold, a rule needs to be a constant:
// - no question
// - no dependency
function isFoldable(rule: RuleNode): boolean {
	const rawNode = rule?.rawNode
	return !(
		'question' in rawNode ||
		// NOTE(@EmileRolley): I assume that a rule can have a [par défaut] attribute without a [question] one.
		// The behavior could be specified.
		'par défaut' in rawNode ||
		'est compressée' in rawNode ||
		'applicable si' in rawNode ||
		'non applicable si' in rawNode
	)
}

function isInParsedRules(parsedRules: ParsedRules, rule: RuleName): boolean {
	return Object.keys(parsedRules).includes(rule)
}

function isEmptyRule(rule: RuleNode): boolean {
	// There is always a 'nom' attribute.
	return Object.keys(rule.rawNode).length <= 1
}

// Replaces boolean values by their string representation in French.
function formatToPulicodesValue(value: any) {
	return typeof value === 'boolean' ? (value ? 'oui' : 'non') : value
}

function replaceAllRefs(
	str: string,
	refName: string,
	constantValue: any
): string {
	const re = new RegExp(`${refName}`, 'g')
	return str.replaceAll(re, constantValue)
}

function lexicalSubstitutionOfRefValue(
	parent: RuleNode,
	constant: RuleNode
): RuleNode | undefined {
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

	const constValue = formatToPulicodesValue(constant.rawNode.valeur)

	if (parent.rawNode.formule) {
		if (typeof parent.rawNode.formule === 'string') {
			parent.rawNode.formule = replaceAllRefs(
				parent.rawNode.formule,
				refName,
				constValue
			)
			return parent
		} else if (parent.rawNode.formule.somme) {
			// TODO: needs to be abstracted
			parent.rawNode.formule.somme = parent.rawNode.formule.somme.map(
				(expr: string | number) => {
					return typeof expr === 'string'
						? replaceAllRefs(expr, refName, constValue)
						: expr
				}
			)
			return parent
		}
	}
	if (parent.rawNode.somme) {
		parent.rawNode.somme = parent.rawNode.somme.map((expr: string | number) => {
			return typeof expr === 'string'
				? replaceAllRefs(expr, refName, constValue)
				: expr
		})
		return parent
	}
	// When a rule defined as an unique string: 'var * var2', it's parsed as a [valeur] attribute not a [formule].
	if (typeof parent.rawNode.valeur === 'string') {
		parent.rawNode.formule = replaceAllRefs(
			parent.rawNode.valeur,
			refName,
			constValue
		)
		delete parent.rawNode.valeur
		return parent
	}
}

// Replaces all references in [refs] (could be childs or parents) of [ruleName]
// by its [rule.valeur].
function searchAndReplaceConstantValueInParentRefs(
	ctx: FoldingCtx,
	ruleName: RuleName,
	rule: RuleNode
): FoldingCtx {
	const refs = ctx.refs.parents.get(ruleName)
	const parentsToRemove: RuleName[] = []

	if (refs) {
		refs
			.map((dottedName) => ctx.parsedRules[dottedName])
			.filter((r) => isFoldable(r))
			.forEach(({ dottedName: parentDottedName }) => {
				const newRule = lexicalSubstitutionOfRefValue(
					ctx.parsedRules[parentDottedName],
					rule
				)
				if (newRule) {
					ctx.parsedRules[parentDottedName] = newRule
					parentsToRemove.push(parentDottedName)
				}
			})

		ctx.refs.parents.set(
			ruleName,
			refs.filter((name) => !parentsToRemove.includes(name))
		)
	}

	return ctx
}

function isAlreadyFolded(rule: RuleNode) {
	return rule.rawNode && 'est compressée' in rule.rawNode
}

function isAConstant(rule: RuleNode) {
	return rule.rawNode.valeur && !(rule.rawNode.formule || rule.rawNode.somme)
}

// Subsitutes [parentRuleNode.formule] ref constant from [refs].
//
// NOTE: It folds child rules in [refs] if possible.
function replaceAllPossibleChildRefs(
	ctx: FoldingCtx,
	parentRuleName: RuleName,
	parentRuleNode: RuleNode,
	refs: RuleName[]
): FoldingCtx {
	if (refs) {
		refs
			.map((dottedName) => ctx.parsedRules[dottedName])
			.filter((r) => isFoldable(r))
			.forEach(({ dottedName: childDottedName }) => {
				let childNode = ctx.parsedRules[childDottedName]

				if (!childNode) {
					// TODO: need to investigate
					return
				}

				if (!isAlreadyFolded(childNode)) {
					ctx = tryToFoldRule(ctx, childDottedName, childNode)
				}
				if (isAConstant(childNode)) {
					const newRule = lexicalSubstitutionOfRefValue(
						parentRuleNode,
						childNode
					)
					if (newRule) {
						ctx.parsedRules[parentRuleName] = newRule
						ctx.parsedRules[parentRuleName].rawNode['est compressée'] = true
						ctx = updateRefCounting(ctx, parentRuleName, [childDottedName])
					}
				}
			})
	}
	return ctx
}

// Removes the [parentRuleName] as a parent dependency of each [childRuleNamesToUpdate].
function updateRefCounting(
	ctx: FoldingCtx,
	parentRuleName: RuleName,
	childRuleNamesToUpdate: RuleName[]
): FoldingCtx {
	childRuleNamesToUpdate.forEach((childRuleDottedName: RuleName) => {
		ctx.refs.parents.set(
			childRuleDottedName,
			ctx.refs.parents
				.get(childRuleDottedName)
				?.filter(
					(dottedName) =>
						isInParsedRules(ctx.parsedRules, dottedName) &&
						dottedName !== parentRuleName
				)
		)
		if (ctx.refs.parents.get(childRuleDottedName)?.length === 0) {
			delete ctx.parsedRules[childRuleDottedName]
			ctx.refs.parents.delete(childRuleDottedName)
		}
	})
	return ctx
}

function tryToFoldRule(
	ctx: FoldingCtx,
	ruleName: RuleName,
	rule: RuleNode
): FoldingCtx {
	if (
		rule &&
		(isAlreadyFolded(rule) || !isInParsedRules(ctx.parsedRules, ruleName))
	) {
		// Already managed rule
		return ctx
	}
	if (isEmptyRule(rule) && ctx.refs.parents.get(ruleName)?.length === 0) {
		// Empty rule with no parent
		delete ctx.parsedRules[ruleName]
		return ctx
	}

	const { nodeValue, missingVariables, traversedVariables } =
		ctx.engine.evaluateNode(rule)

	// NOTE(@EmileRolley): we need to evaluate due to possible standalone rule [formule]
	// parsed as a [valeur].
	if (rule.rawNode.valeur && traversedVariables.length > 0) {
		rule.rawNode.formule = rule.rawNode.valeur
		delete rule.rawNode.valeur
	}

	// Constant leaf -> search and replace the constant in all its parents.
	if (rule.rawNode.valeur) {
		ctx = searchAndReplaceConstantValueInParentRefs(ctx, ruleName, rule)

		// NOTE(@EmileRolley): temporary work around until all mechanisms are supported.
		// Indeed, when replacing a leaf ref by its value in all its parents, it should always be removed.
		const parents = ctx.refs.parents.get(ruleName)
		if (parents && parents.length === 0) {
			delete ctx.parsedRules[ruleName]
		}

		return ctx
	}

	const missingVariablesNames = Object.keys(missingVariables)

	// Potential leaf -> try to evaluate the formula at compile time.
	if (rule.rawNode.formule || rule.rawNode.somme) {
		// The computation could be done a compile time.
		if (missingVariablesNames.length === 0) {
			ctx.parsedRules[ruleName].rawNode.valeur =
				formatToPulicodesValue(nodeValue)
			ctx.parsedRules[ruleName].rawNode['est compressée'] = true

			if (rule.rawNode.formule) delete ctx.parsedRules[ruleName].rawNode.formule
			if (rule.rawNode.somme) delete ctx.parsedRules[ruleName].rawNode.somme

			ctx = updateRefCounting(ctx, ruleName, traversedVariables)
		}
		// Otherwise, try to replace internal refs if possible.
		else {
			const childs = ctx.refs.childs.get(ruleName)

			if (childs && childs.length > 0) {
				replaceAllPossibleChildRefs(ctx, ruleName, rule, childs)
			}
		}
	}
	return ctx
}

/**
 * Applies a constant folding optimisation pass on parsed rules of [engine].
 *
 * If the [targets] are specified, at the end, only folded root nodes specified
 * in [targets] are kept.
 * Otherwise, all root nodes are preserved.
 */
export default function constantFolding(
	engine: Engine,
	targets?: RuleName[]
): ParsedRules {
	const engineCtx: Context<RuleName> = engine.context
	const parsedRules: ParsedRules = engine.getParsedRules()
	const refs: RefMaps = getReferences(engineCtx, parsedRules)
	let ctx: FoldingCtx = { engine, parsedRules, refs }
	let parsedRulesEntries: [RuleName, RuleNode<RuleName>][] | undefined =
		undefined

	parsedRulesEntries = Object.entries(ctx.parsedRules)
	parsedRulesEntries
		.filter(([_, rule]) => isFoldable(rule))
		.forEach(([ruleName, ruleNode]) => {
			ctx = tryToFoldRule(ctx, ruleName, ruleNode)
		})

	if (targets) {
		return Object.fromEntries(
			Object.entries(ctx.parsedRules).filter(([ruleName, _]) => {
				const parents = ctx.refs.parents.get(ruleName)
				return targets.includes(ruleName) || (parents && parents.length > 0)
			})
		)
	}

	return ctx.parsedRules
}
