import { Logger, ParsedRules, PublicodesError } from '.'
import { makeASTTransformer, makeASTVisitor } from './AST'
import { ASTNode } from './AST/types'
import { PublicodesInternalError } from './error'
import { defaultNode, notApplicableNode } from './evaluationUtils'
import parse from './parse'
import { Context, ReferencesMaps, RulesReplacements } from './parsePublicodes'
import { Rule, RuleNode } from './rule'
import { updateReferencesMapsFromReferenceNode } from './ruleUtils'
import { mergeWithArray } from './utils'

export type ReplacementRule = {
	nodeKind: 'replacementRule'
	definitionRule: ASTNode & { nodeKind: 'reference' } & { dottedName: string }
	replacedReference: ASTNode & { nodeKind: 'reference' }
	priority?: number
	whiteListedNames: Array<ASTNode & { nodeKind: 'reference' }>
	rawNode: any
	blackListedNames: Array<ASTNode & { nodeKind: 'reference' }>
	remplacementRuleId: number
	replaceByNonApplicable: boolean
}

// Replacements depend on the context and their evaluation implies using
// "variations" node everywhere there is a reference to the original rule.
// However for performance reason we want to mutualize identical "variations"
// nodes instead of duplicating them, to avoid wasteful computations.
//
// The implementation works by first attributing an identifier for each
// replacementRule. We then use this identifier to create a cache key that
// represents the combinaison of applicables replacements for a given reference.
// For example if replacements 12, 13 et 643 are applicable we use the key
// `12-13-643` as the cache identifier in the `inlineReplacements` function.
let remplacementRuleId = 0
const cache = {}

export function parseReplacements(
	replacements: Rule['remplace'],
	context: Context,
): Array<ReplacementRule> {
	if (!replacements) {
		return []
	}

	return (Array.isArray(replacements) ? replacements : [replacements]).map(
		(replacement) => {
			if (typeof replacement === 'string') {
				replacement = { 'références à': replacement }
			}

			const replacedReference = parse(replacement['références à'], context)

			const [whiteListedNames, blackListedNames] = [
				replacement.dans ?? [],
				replacement['sauf dans'] ?? [],
			]
				.map((dottedName) =>
					Array.isArray(dottedName) ? dottedName : [dottedName],
				)
				.map((refs) => refs.map((ref) => parse(ref, context)))
			if (
				replacement.priorité != null &&
				(typeof replacement.priorité !== 'number' || replacement.priorité < 0)
			) {
				throw new PublicodesError(
					'SyntaxError',
					'La priorité du remplacement doit être un nombre positif',
					context,
				)
			}
			return {
				nodeKind: 'replacementRule',
				rawNode: replacement,
				priority: replacement.priorité,
				definitionRule: parse(context.dottedName, context),
				replacedReference,
				replaceByNonApplicable: false,
				whiteListedNames,
				blackListedNames,
				remplacementRuleId: remplacementRuleId++,
			} as ReplacementRule
		},
	)
}

export function parseRendNonApplicable(
	rules: Rule['rend non applicable'],
	context: Context,
): Array<ReplacementRule> {
	const rendNonApplicableReplacements = parseReplacements(rules, context)
	rendNonApplicableReplacements.forEach(
		(r) => (r.replaceByNonApplicable = true),
	)
	return rendNonApplicableReplacements
}

export function getReplacements(
	parsedRules: Record<string, RuleNode>,
): RulesReplacements<string> {
	const ret = {}
	for (const dottedName in parsedRules) {
		const rule = parsedRules[dottedName]
		for (const replacement of rule.replacements) {
			if (!replacement.replacedReference.dottedName) {
				throw new PublicodesInternalError(replacement)
			}
			const key = replacement.replacedReference.dottedName
			ret[key] = [...(ret[key] ?? []), replacement]
		}
	}

	return ret
}

export function inlineReplacements<
	NewNames extends string,
	PreviousNames extends string,
>({
	newRules,
	previousReplacements,
	parsedRules,
	referencesMaps,
	logger,
}: {
	newRules: ParsedRules<NewNames>
	previousReplacements: RulesReplacements<PreviousNames>
	parsedRules: ParsedRules<PreviousNames | NewNames>
	referencesMaps: ReferencesMaps<NewNames | PreviousNames>
	logger: Logger
}): [
	ParsedRules<NewNames | PreviousNames>,
	RulesReplacements<NewNames | PreviousNames>,
] {
	type Names = NewNames | PreviousNames
	const newReplacements = getReplacements(newRules) as RulesReplacements<Names>

	const ruleNamesWithNewReplacements = new Set([]) as Set<Names>
	for (const replacedReference in newReplacements) {
		const rulesThatUse =
			referencesMaps.rulesThatUse.get(replacedReference as NewNames | Names) ??
			[]

		for (const value of rulesThatUse) {
			ruleNamesWithNewReplacements.add(value)
		}
	}

	const newRuleNamesWithPreviousReplacements: Set<NewNames> = new Set(
		(Object.keys(newRules) as Array<NewNames>).filter((ruleName) =>
			[...(referencesMaps.referencesIn.get(ruleName) ?? new Set())].some(
				(reference) =>
					(previousReplacements[reference as PreviousNames] ?? []).length,
			),
		),
	)

	const replacements = mergeWithArray(previousReplacements, newReplacements)
	if (
		!newRuleNamesWithPreviousReplacements.size &&
		!ruleNamesWithNewReplacements.size
	) {
		return [parsedRules, replacements]
	}

	const inlinePreviousReplacement = makeReplacementInliner(
		previousReplacements,
		referencesMaps,
		logger,
	)
	const inlineNewReplacement = makeReplacementInliner(
		newReplacements,
		referencesMaps,
		logger,
	)

	newRuleNamesWithPreviousReplacements.forEach((name) => {
		parsedRules[name] = inlinePreviousReplacement(
			parsedRules[name],
		) as RuleNode<Names>
	})
	ruleNamesWithNewReplacements.forEach((name) => {
		parsedRules[name] = inlineNewReplacement(
			parsedRules[name],
		) as RuleNode<Names>
	})

	return [parsedRules, replacements]
}

export function makeReplacementInliner(
	replacements: RulesReplacements<string>,
	referencesMaps: ReferencesMaps<string>,
	logger: Logger,
): (n: ASTNode) => ASTNode {
	return makeASTTransformer((node, transform) => {
		if (
			node.nodeKind === 'replacementRule' ||
			node.nodeKind === 'inversion' ||
			node.nodeKind === 'une possibilité'
		) {
			return false
		}
		if (node.nodeKind === 'contexte') {
			// We don't replace references in contexte keys
			return {
				...node,
				explanation: {
					...node.explanation,
					node: transform(node.explanation.node),
					contexte: node.explanation.contexte.map(([name, value]) => [
						name,
						transform(value),
					]),
				},
			}
		}
		if (node.nodeKind === 'reference') {
			if (!node.dottedName) {
				throw new PublicodesInternalError(node)
			}
			const replacedReferenceNode = replace(
				node,
				replacements[node.dottedName] ?? [],
				logger,
			)
			// Collect inlined replacement
			makeASTVisitor((n) => {
				updateReferencesMapsFromReferenceNode(
					n,
					referencesMaps,
					node.contextDottedName,
				)
				return 'continue'
			})(replacedReferenceNode)
			return replacedReferenceNode
		}
	})
}

function replace(
	node: ASTNode & { nodeKind: 'reference' }, //& { dottedName: string },
	replacements: Array<ReplacementRule>,
	logger: Logger,
): ASTNode {
	// TODO : handle transitivité

	const applicableReplacements = replacements
		.filter(
			({ definitionRule }) =>
				definitionRule.dottedName !== node.contextDottedName,
		)
		.filter(
			({ whiteListedNames }) =>
				!whiteListedNames.length ||
				whiteListedNames.some((name) =>
					node.contextDottedName.startsWith(name.dottedName as string),
				),
		)
		.filter(
			({ blackListedNames }) =>
				!blackListedNames.length ||
				blackListedNames.every(
					(name) =>
						!node.contextDottedName.startsWith(name.dottedName as string),
				),
		)
		.reverse()
		.sort((a, b) => {
			const result = (b.priority ?? 0) - (a.priority ?? 0)
			if (result !== 0) {
				return result
			}
			return b.definitionRule.dottedName.localeCompare(
				a.definitionRule.dottedName,
			)
		})

	if (!applicableReplacements.length) {
		return node
	}

	const applicableReplacementsCacheKey = applicableReplacements
		.map((n) => n.remplacementRuleId)
		.join('-')
	if (cache[applicableReplacementsCacheKey]) {
		return cache[applicableReplacementsCacheKey]
	}
	const replacementNode = {
		nodeKind: 'variations',
		explanation: [
			...applicableReplacements.map(
				({ definitionRule, replaceByNonApplicable }) => ({
					condition: definitionRule,
					consequence:
						replaceByNonApplicable ? notApplicableNode : definitionRule,
				}),
			),
			{ condition: defaultNode(true), consequence: node },
		],
	}
	;(replacementNode as any).sourceMap = {
		mecanismName: 'replacement',
		args: {
			applicableReplacements,
			originalNode: node,
		},
	}
	cache[applicableReplacementsCacheKey] = replacementNode
	return cache[applicableReplacementsCacheKey]
}
