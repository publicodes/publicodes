import Engine, {
	reduceAST,
	ParsedRules,
	transformAST,
	traverseASTNode,
	Unit,
	EvaluatedNode,
	utils,
	Evaluation,
} from 'publicodes'
import type { RuleNode, ASTNode } from 'publicodes'
import { RuleName } from '../commons'

type RefMap = Map<RuleName, Set<RuleName> | undefined>

type RefMaps = {
	parents: RefMap
	childs: RefMap
}

export type PredicateOnRule = (rule: RuleNode) => boolean

/**
 * Parameters for the constant folding optimization pass.
 *
 * @field toAvoid A predicate that returns true if the rule should be avoided to be folded,
 * if not present, all rules will be folded.
 * @field toKeep A predicate that returns true if the rule should be kept AFTER being folded,
 * if not present, all folded rules will be kept.
 * @field isFoldedAttr The attribute name to use to mark a rule as folded, default to 'optimized'.
 */
export type FoldingParams = {
	toAvoid?: PredicateOnRule
	toKeep?: PredicateOnRule
	isFoldedAttr?: string
}

type FoldingCtx = {
	engine: Engine
	parsedRules: ParsedRules<RuleName>
	refs: RefMaps
	toKeep?: PredicateOnRule
	params: FoldingParams
	/**
	 * The rules that are evaluated with a modified situation (in a [contexte]
	 * mechanism or with a [remplacement]) and we don't want to be folded.
	 *
	 * @example
	 * ```
	 * rule:
	 *	  valeur: rule2
	 *	  contexte:
	 *	    rule3: 10
	 *	    rule4: 20
	 * ...
	 * ```
	 * In this case, we don't want to fold [rule2] because it's evaluated with a
	 * modified situation (unless it's a constant). We also don't want to fold
	 * [rule3] and [rule4] because they are used in the contexte of [rule].
	 */
	unfoldableRules: Set<RuleName>
}

function addMapEntry(map: RefMap, key: RuleName, values: Set<RuleName>) {
	const vals = map.get(key) ?? new Set()
	values.forEach((val) => vals.add(val))
	map.set(key, vals)
}

function initFoldingCtx(
	engine: Engine,
	foldingParams?: FoldingParams,
): FoldingCtx {
	const refs: RefMaps = {
		parents: new Map(),
		childs: new Map(),
	}
	const unfoldableRules = new Set<RuleName>()
	const parsedRules = copyFullParsedRules(engine)

	for (const ruleName in parsedRules) {
		const ruleNode = parsedRules[ruleName]

		if (ruleNode.replacements.length > 0) {
			unfoldableRules.add(ruleName)
			ruleNode.replacements.forEach((replacement) => {
				// TODO: we could use white-listed and black-listed rules to be more
				// precise about which rules we want to fold. But for now, we
				// consider that all rules that are replaced are not foldable in
				// all cases.
				unfoldableRules.add(replacement.replacedReference.name)
			})
		}

		if (ruleNode.possibilities) {
			ruleNode.possibilities?.explanation.map((possibility) => {
				if (possibility.dottedName) {
					unfoldableRules.add(possibility.dottedName)
				}
			})
		}

		if (ruleNode.explanation.valeur.nodeKind === 'contexte') {
			engine.cache.traversedVariablesStack = []
			const evaluation = engine.evaluate(ruleName)

			// We don't want to fold a rule which can be nullable with a different situation
			// For example, if its namespace is conditionnaly applicable.
			//
			// TODO(@EmileRolley): for now, all ref nodes inside a contexte are considered
			// as not foldable. We could be more precise by associating a ref node with
			// the rules that are used in its contexte therefore we could fold the ref node
			// in all other cases.
			if (
				Object.keys(evaluation.missingVariables).length !== 0 ||
				isNullable(evaluation)
			) {
				unfoldableRules.add(ruleName)
				ruleNode.explanation.valeur.explanation.contexte.forEach(([ref]) => {
					if (ref.dottedName) {
						unfoldableRules.add(ref.dottedName)
					}
				})
			}
		}

		const traversedRefs: Set<RuleName> =
			// We need to traverse the AST to find all the references used inside a rule.
			//
			// NOTE: We can't use the [referencesMap] from the engine's context because it
			// contains references to rules that are beyond the scope of the current
			// rule and we only want to consider the references that are used inside the
			// current rule.
			reduceAST(
				(acc: Set<RuleName>, node: ASTNode) => {
					if (
						node.nodeKind === 'reference' &&
						node.dottedName &&
						node.dottedName !== ruleName &&
						!node.dottedName.endsWith('$SITUATION')
					) {
						return acc.add(node.dottedName)
					}
				},
				new Set(),
				ruleNode.explanation.valeur,
			) ?? new Set()

		if (traversedRefs.size > 0) {
			addMapEntry(refs.childs, ruleName, traversedRefs)
			traversedRefs.forEach((traversedVar) => {
				addMapEntry(refs.parents, traversedVar, new Set([ruleName]))
			})
		}
	}

	return {
		engine,
		parsedRules,
		refs,
		unfoldableRules,
		params: {
			...foldingParams,
			isFoldedAttr: foldingParams?.isFoldedAttr ?? 'optimized',
		},
	}
}

const unfoldableAttr = ['par défaut', 'question']

function isFoldable(ctx: FoldingCtx, rule: RuleNode): boolean {
	let childInContext = false
	const childs = ctx.refs.childs.get(rule.dottedName)

	childs?.forEach((child) => {
		if (ctx.unfoldableRules.has(child)) {
			childInContext = true
			return
		}
	})

	return (
		rule !== undefined &&
		!ctx.params.toAvoid?.(rule) &&
		!unfoldableAttr.find((attr) => attr in rule.rawNode) &&
		!ctx.unfoldableRules.has(rule.dottedName) &&
		!childInContext
	)
}

function isEmptyRule(rule: RuleNode): boolean {
	return Object.keys(rule.rawNode).length === 0
}

/**
 * Replaces all references in parent refs of [ruleName] by its [constantNode]
 */
function searchAndReplaceConstantValueInParentRefs(
	ctx: FoldingCtx,
	ruleName: RuleName,
	constantNode: ASTNode,
) {
	const refs = ctx.refs.parents.get(ruleName)

	if (refs) {
		for (const parentName of refs) {
			const parentRule = ctx.parsedRules[parentName]

			if (!ctx.params.toAvoid?.(parentRule)) {
				const newRule = traverseASTNode(
					transformAST((node) => {
						if (node.nodeKind === 'reference' && node.dottedName === ruleName) {
							return constantNode
						}
					}),
					parentRule,
				) as RuleNode

				if (newRule !== undefined) {
					ctx.parsedRules[parentName] = newRule
					ctx.parsedRules[parentName].rawNode[ctx.params.isFoldedAttr!] =
						'partially'
					removeInMap(ctx.refs.parents, ruleName, parentName)
				}
			}
		}
	}
}

function isAlreadyFolded(params: FoldingParams, rule: RuleNode): boolean {
	return (
		'rawNode' in rule &&
		params.isFoldedAttr! in rule.rawNode &&
		rule.rawNode[params.isFoldedAttr!] === 'fully'
	)
}

function removeInMap<K, V>(map: Map<K, Set<V> | undefined>, key: K, val: V) {
	if (map.has(key)) {
		map.get(key)!.delete(val)
	}
}

function removeRuleFromRefs(ref: RefMap, ruleName: RuleName) {
	for (const rule of ref.keys()) {
		removeInMap(ref, rule, ruleName)
	}
}

function tryToDeleteRule(ctx: FoldingCtx, dottedName: RuleName): boolean {
	const ruleNode = ctx.parsedRules[dottedName]

	if (
		(ctx.params.toKeep === undefined || !ctx.params.toKeep(ruleNode)) &&
		isFoldable(ctx, ruleNode)
	) {
		removeRuleFromRefs(ctx.refs.parents, dottedName)
		removeRuleFromRefs(ctx.refs.childs, dottedName)
		delete ctx.parsedRules[dottedName]
		ctx.refs.parents.delete(dottedName)
		ctx.refs.childs.delete(dottedName)

		return true
	}

	return false
}

/** Removes the [parentRuleName] as a parent dependency of each [childRuleNamesToUpdate]. */
function updateRefCounting(
	ctx: FoldingCtx,
	parentRuleName: RuleName,
	ruleNamesToUpdate: Set<RuleName>,
) {
	for (const ruleNameToUpdate of ruleNamesToUpdate) {
		removeInMap(ctx.refs.parents, ruleNameToUpdate, parentRuleName)
		if (ctx.refs.parents.get(ruleNameToUpdate)?.size === 0) {
			tryToDeleteRule(ctx, ruleNameToUpdate)
		}
	}
}

function replaceRuleWithEvaluatedNodeValue(
	rule: RuleNode,
	nodeValue: Evaluation,
	unit: Unit | undefined,
): EvaluatedNode<'constant'> {
	const constantNode: EvaluatedNode<'constant'> = {
		nodeValue,
		type:
			typeof nodeValue === 'number' ? 'number'
			: typeof nodeValue === 'boolean' ? 'boolean'
			: typeof nodeValue === 'string' ? 'string'
			: undefined,

		nodeKind: 'constant',
		missingVariables: {},
		unit,
		rawNode: {
			valeur: nodeValue?.toString(),
		},
		isNullable: false,
	}

	if (rule.explanation.valeur.nodeKind === 'contexte') {
		// We remove the contexte as it's now considered as a constant.
		rule.explanation.valeur = rule.explanation.valeur.explanation.valeur
	}

	rule.explanation.valeur = traverseASTNode(
		transformAST((node) => {
			if (node.nodeKind === 'condition') {
				/* we found the first condition, which wrapped the rule in the form of:
				 *
				 * - si:
				 *   est non défini: <rule> . $SITUATION
				 * - alors: <rule>
				 * - sinon: <rule> . $SITUATION
				 */
				node.explanation.alors = constantNode
				return node
			}
		}),
		rule,
	)

	return constantNode
}

function isNullable(node: ASTNode): boolean {
	//@ts-expect-error FIXME:
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	if (node?.explanation?.nullableParent !== undefined) {
		return true
	}

	return reduceAST(
		(_, node) => {
			if (!node) {
				return false
			}

			//@ts-expect-error FIXME:
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (node?.explanation?.nullableParent !== undefined) {
				return true
			}
		},
		false,
		// We expect a reference node here
		// @ts-expect-error FIXME:
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		node?.explanation?.valeur,
	)
}

function fold(ctx: FoldingCtx, ruleName: RuleName, rule: RuleNode): void {
	if (
		rule !== undefined &&
		(!isFoldable(ctx, rule) ||
			!utils.isAccessible(ctx.parsedRules, '', rule.dottedName) ||
			isAlreadyFolded(ctx.params, rule) ||
			!(ruleName in ctx.parsedRules))
	) {
		return
	}

	const ruleParents = ctx.refs.parents.get(ruleName)
	if (
		isEmptyRule(rule) &&
		(ruleParents === undefined || ruleParents?.size === 0)
	) {
		// Empty rule with no parent
		tryToDeleteRule(ctx, ruleName)
		return
	}

	const evaluation: ASTNode & EvaluatedNode = ctx.engine.evaluate(
		rule.dottedName,
	)
	const { missingVariables, nodeValue, unit } = evaluation
	const missingVariablesNames = Object.keys(missingVariables)

	if (
		missingVariablesNames.length === 0 &&
		// We don't want to fold a rule which can be nullable with a different situation.
		// For example, if its namespace is conditionnaly applicable.
		!isNullable(evaluation)
	) {
		const constantNode = replaceRuleWithEvaluatedNodeValue(
			rule,
			nodeValue,
			unit,
		)
		searchAndReplaceConstantValueInParentRefs(ctx, ruleName, constantNode)

		const childs = ctx.refs.childs.get(ruleName) ?? new Set()

		updateRefCounting(ctx, ruleName, childs)
		delete ctx.parsedRules[ruleName].rawNode.formule

		const parents = ctx.refs.parents.get(ruleName)
		// NOTE(@EmileRolley): if the rule has no parent ([parents === undefined])
		// we assume it's a root rule and we don't want to delete it.
		if (parents !== undefined && parents.size === 0) {
			if (tryToDeleteRule(ctx, ruleName)) {
				return
			}
		}

		ctx.parsedRules[ruleName].rawNode[ctx.params.isFoldedAttr!] = 'fully'

		return
	}
}

/**
 * Deep copies the private [parsedRules] field of [engine] (without the '$SITUATION'
 * rules).
 */
function copyFullParsedRules(engine: Engine): ParsedRules<RuleName> {
	const parsedRules: ParsedRules<RuleName> = {}

	for (const ruleName in engine.baseContext.parsedRules) {
		if (!ruleName.endsWith('$SITUATION')) {
			parsedRules[ruleName] = structuredClone(
				engine.baseContext.parsedRules[ruleName],
			)
		}
	}

	return parsedRules
}

/**
 * Applies a constant folding optimisation pass on parsed rules of [engine].
 *
 * @param engine The engine instantiated with the rules to fold.
 * @param params The folding parameters.
 *
 * @returns The parsed rules with constant folded rules.
 */
export function constantFolding(
	engine: Engine,
	params?: FoldingParams,
): ParsedRules<RuleName> {
	const ctx = initFoldingCtx(engine, params)

	let nbRules = Object.keys(ctx.parsedRules).length
	let nbRulesBefore = undefined

	while (nbRules !== nbRulesBefore) {
		for (const ruleName in ctx.parsedRules) {
			const ruleNode = ctx.parsedRules[ruleName]

			if (isFoldable(ctx, ruleNode) && !isAlreadyFolded(ctx.params, ruleNode)) {
				fold(ctx, ruleName, ruleNode)
			}
		}
		nbRulesBefore = nbRules
		nbRules = Object.keys(ctx.parsedRules).length
	}

	if (ctx.params.toKeep) {
		for (const ruleName in ctx.parsedRules) {
			const ruleNode = ctx.parsedRules[ruleName]
			const parents = ctx.refs.parents.get(ruleName)

			if (
				isFoldable(ctx, ruleNode) &&
				!ctx.params.toKeep(ruleNode) &&
				(!parents || parents?.size === 0)
			) {
				delete ctx.parsedRules[ruleName]
			}
		}
	}

	return ctx.parsedRules
}
