import Engine, { reduceAST } from 'publicodes'

import type { RawPublicodes, RuleNode, ASTNode, Context } from 'publicodes'
import type { RuleName, ParsedRules } from './commons'

type RefMap = Map<
	RuleName,
	// NOTE: It's an array but it's built from a Set, so no duplication
	RuleName[]
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

// Removes references to:
// - $SITUATION rules
// - parent namespaces
function removeParentReferences(
	parsedRules: ParsedRules,
	[dottedName, set]: [RuleName, Set<RuleName>]
): [RuleName, RuleName[]] {
	const splittedDottedName = dottedName.split(' . ')
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
	return {
		parents: getFilteredReferences(context.referencesMaps.rulesThatUse),
		childs: getFilteredReferences(context.referencesMaps.referencesIn),
	}
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

	if (parent.rawNode.formule) {
		parent.rawNode.formule = parent.rawNode.formule.replaceAll(
			refName,
			constant.rawNode.valeur
		)
	}
	if (parent.rawNode.somme) {
		parent.rawNode.somme = parent.rawNode.somme.map((expr: string | number) => {
			return typeof expr === 'string'
				? expr.replaceAll(refName, constant.rawNode.valeur)
				: expr
		})
	}
	return parent
}

// Replaces all references in [refs] (could be childs or parents) of [ruleName]
// by its [rule.valeur].
function searchAndReplaceConstantValueInParentRefs(
	ctx: FoldingCtx,
	ruleName: RuleName,
	rule: RuleNode
): FoldingCtx {
	const refs = ctx.refs.parents.get(ruleName)

	if (refs) {
		refs
			.map((dottedName) => ctx.parsedRules[dottedName])
			.filter((r) => r)
			.forEach(({ dottedName }) => {
				ctx.parsedRules[dottedName] = lexicalSubstitutionOfRefValue(
					ctx.parsedRules[dottedName],
					rule
				)
				ctx.parsedRules[dottedName].rawNode['est compressée'] = true
			})
	}

	return ctx
}

function isAlreadyFolded(rule: RuleNode) {
	return rule.rawNode['est compressée']
}

function isAConstant(rule: RuleNode) {
	return rule.rawNode.valeur && !(rule.rawNode.formule || rule.rawNode.somme)
}

function searchAndReplaceConstantValueInChildRefs(
	ctx: FoldingCtx,
	rule: RuleNode,
	refs: RuleName[]
): FoldingCtx {
	if (refs) {
		refs
			.map((dottedName) => ctx.parsedRules[dottedName])
			.filter((r) => r)
			.forEach(({ dottedName }) => {
				let childNode = ctx.parsedRules[dottedName]

				if (!isAlreadyFolded(childNode)) {
					ctx = tryToFoldRule(ctx, dottedName, childNode)
				}
				if (isAConstant(childNode)) {
					ctx.parsedRules[dottedName] = lexicalSubstitutionOfRefValue(
						rule,
						childNode
					)
					ctx.parsedRules[dottedName].rawNode['est compressée'] = true
				}
			})
	}
	return ctx
}

function tryToFoldRule(
	ctx: FoldingCtx,
	ruleName: RuleName,
	rule: RuleNode
): FoldingCtx {
	if (isAlreadyFolded(rule) || !isInParsedRules(ctx.parsedRules, ruleName)) {
		// Already managed rule
		return ctx
	}
	if (isEmptyRule(rule)) {
		delete ctx.parsedRules[ruleName]
		return ctx
	}

	// Constant leaf -> search and replace the constant in all its parents.
	if (rule.rawNode.valeur) {
		ctx = searchAndReplaceConstantValueInParentRefs(ctx, ruleName, rule)
		delete ctx.parsedRules[ruleName]
		return ctx
	}

	// Potential leaf -> try to evaluate the formula at compile time.
	if (rule.rawNode.formule || rule.rawNode.somme) {
		const { nodeValue, missingVariables, traversedVariables } =
			ctx.engine.evaluateNode(rule)

		// The computation could be done a compile time.
		if (Object.keys(missingVariables).length === 0) {
			ctx.parsedRules[ruleName].rawNode.valeur = nodeValue
			ctx.parsedRules[ruleName].rawNode['est compressée'] = true

			if (rule.rawNode.formule) delete ctx.parsedRules[ruleName].rawNode.formule
			if (rule.rawNode.somme) delete ctx.parsedRules[ruleName].rawNode.somme

			// Update ref counting
			traversedVariables.forEach((childRuleDottedName: RuleName) => {
				let child = ctx.refs.parents.get(childRuleDottedName)
				if (child) {
					ctx.refs.parents.set(
						childRuleDottedName,
						child.filter(
							(dottedName) =>
								isInParsedRules(ctx.parsedRules, dottedName) &&
								dottedName !== ruleName
						)
					)
					if (ctx.refs.parents.get(childRuleDottedName)?.length === 0) {
						delete ctx.parsedRules[childRuleDottedName]
						ctx.refs.parents.delete(childRuleDottedName)
					}
				}
			})
		}
		// Try to replace internal refs if possible
		else {
			const childs = ctx.refs.childs.get(ruleName)
			if (childs && childs.length > 0) {
				searchAndReplaceConstantValueInChildRefs(ctx, rule, childs)
				// TODO: Update ref counting
			}
		}
	}
	return ctx
}

export default function constantFolding(engine: Engine): ParsedRules {
	const engineCtx: Context<RuleName> = engine.context
	const parsedRules: ParsedRules = engine.getParsedRules()
	const refs: RefMaps = getReferences(engineCtx, parsedRules)
	let ctx: FoldingCtx = { engine, parsedRules, refs }

	Object.entries(parsedRules)
		.filter(([_, rule]) => isFoldable(rule))
		.forEach(([ruleName, ruleNode]) => {
			ctx = tryToFoldRule(ctx, ruleName, ruleNode)
		})

	return ctx.parsedRules
}
