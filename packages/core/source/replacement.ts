import { Logger, ParsedRules } from '.'
import { makeASTTransformer, makeASTVisitor } from './AST'
import { ASTNode } from './AST/types'
import { PublicodesInternalError, warning } from './error'
import { defaultNode } from './evaluationUtils'
import { notApplicableNode } from './mecanisms/inlineMecanism'
import parse from './parse'
import { Context, ReferencesMaps, RulesReplacements } from './parsePublicodes'
import { Rule, RuleNode } from './rule'
import { updateReferencesMapsFromReferenceNode } from './ruleUtils'
import { mergeWithArray } from './utils'

export type ReplacementRule = {
	nodeKind: 'replacementRule'
	definitionRule: ASTNode & { nodeKind: 'reference' }
	replacedReference: ASTNode & { nodeKind: 'reference' }
	replacementNode: ASTNode
	whiteListedNames: Array<ASTNode & { nodeKind: 'reference' }>
	rawNode: any
	blackListedNames: Array<ASTNode & { nodeKind: 'reference' }>
	remplacementRuleId: number
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
	context: Context
): Array<ReplacementRule> {
	if (!replacements) {
		return []
	}

	return (Array.isArray(replacements) ? replacements : [replacements]).map(
		(replacement) => {
			if (typeof replacement === 'string') {
				replacement = { règle: replacement }
			}

			const replacedReference = parse(replacement.règle, context)
			const replacementNode = parse(
				replacement.par ?? context.dottedName,
				context
			)

			const [whiteListedNames, blackListedNames] = [
				replacement.dans ?? [],
				replacement['sauf dans'] ?? [],
			]
				.map((dottedName) =>
					Array.isArray(dottedName) ? dottedName : [dottedName]
				)
				.map((refs) => refs.map((ref) => parse(ref, context)))

			return {
				nodeKind: 'replacementRule',
				rawNode: replacement,
				definitionRule: parse(context.dottedName, context),
				replacedReference,
				replacementNode,
				whiteListedNames,
				blackListedNames,
				remplacementRuleId: remplacementRuleId++,
			} as ReplacementRule
		}
	)
}

export function parseRendNonApplicable(
	rules: Rule['rend non applicable'],
	context: Context
): Array<ReplacementRule> {
	return parseReplacements(rules, context).map(
		(replacement) =>
			({
				...replacement,
				replacementNode: notApplicableNode,
			} as ReplacementRule)
	)
}

export function getReplacements(
	parsedRules: Record<string, RuleNode>
): RulesReplacements<string> {
	return Object.values(parsedRules)
		.flatMap((rule) => rule.replacements)
		.reduce((acc, r: ReplacementRule) => {
			if (!r.replacedReference.dottedName) {
				throw new PublicodesInternalError(r)
			}
			const key = r.replacedReference.dottedName
			return { ...acc, [key]: [...(acc[key] ?? []), r] }
		}, {})
}

export function inlineReplacements<
	NewNames extends string,
	PreviousNames extends string
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
	RulesReplacements<NewNames | PreviousNames>
] {
	type Names = NewNames | PreviousNames
	const newReplacements = getReplacements(newRules) as RulesReplacements<Names>

	const ruleNamesWithNewReplacements = (
		Object.keys(newReplacements) as Array<NewNames | Names>
	).reduce((acc, replacedReference) => {
		;(referencesMaps.rulesThatUse.get(replacedReference) ?? []).forEach(
			(value) => acc.add(value)
		)
		return acc
	}, new Set([]) as Set<Names>)

	const newRuleNamesWithPreviousReplacements: Set<NewNames> = new Set(
		(Object.keys(newRules) as Array<NewNames>).filter((ruleName) =>
			[...(referencesMaps.referencesIn.get(ruleName) ?? new Set())].some(
				(reference) =>
					(previousReplacements[reference as PreviousNames] ?? []).length
			)
		)
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
		logger
	)
	const inlineNewReplacement = makeReplacementInliner(
		newReplacements,
		referencesMaps,
		logger
	)

	newRuleNamesWithPreviousReplacements.forEach((name) => {
		parsedRules[name] = inlinePreviousReplacement(
			parsedRules[name]
		) as RuleNode<Names>
	})
	ruleNamesWithNewReplacements.forEach((name) => {
		parsedRules[name] = inlineNewReplacement(
			parsedRules[name]
		) as RuleNode<Names>
	})

	return [parsedRules, replacements]
}

export function makeReplacementInliner(
	replacements: RulesReplacements<string>,
	referencesMaps: ReferencesMaps<string>,
	logger: Logger
): (n: ASTNode) => ASTNode {
	return makeASTTransformer((node, transform) => {
		if (
			node.nodeKind === 'replacementRule' ||
			node.nodeKind === 'inversion' ||
			node.nodeKind === 'une possibilité'
		) {
			return false
		}
		if (node.nodeKind === 'recalcul') {
			// We don't replace references in recalcul keys
			return {
				...node,
				explanation: {
					...node.explanation,
					recalculNode: transform(node.explanation.recalculNode),
					amendedSituation: node.explanation.amendedSituation.map(
						([name, value]) => [name, transform(value)]
					),
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
				logger
			)
			// Collect inlined replacement
			makeASTVisitor((n) => {
				updateReferencesMapsFromReferenceNode(
					n,
					referencesMaps,
					node.contextDottedName
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
	logger: Logger
): ASTNode {
	// TODO : handle transitivité

	const applicableReplacements = replacements
		.filter(
			({ definitionRule }) =>
				definitionRule.dottedName !== node.contextDottedName
		)
		.filter(
			({ whiteListedNames }) =>
				!whiteListedNames.length ||
				whiteListedNames.some((name) =>
					node.contextDottedName.startsWith(name.dottedName as string)
				)
		)
		.filter(
			({ blackListedNames }) =>
				!blackListedNames.length ||
				blackListedNames.every(
					(name) =>
						!node.contextDottedName.startsWith(name.dottedName as string)
				)
		)
		.sort((r1, r2) => {
			// Replacement with whitelist conditions have precedence over the others
			const criterion1 =
				+!!r2.whiteListedNames.length - +!!r1.whiteListedNames.length
			// Replacement with blacklist condition have precedence over the others
			const criterion2 =
				+!!r2.blackListedNames.length - +!!r1.blackListedNames.length
			return criterion1 || criterion2
		})
	if (!applicableReplacements.length) {
		return node
	}
	if (applicableReplacements.length > 1) {
		const displayVerboseWarning = false
		if (displayVerboseWarning) {
			warning(
				logger,
				`
				Il existe plusieurs remplacements pour la référence '${node.dottedName}'.
				Lors de l'execution, ils seront résolus dans l'odre suivant :
				${applicableReplacements.map(
					(replacement) =>
						`\n\t- Celui définit dans la règle '${replacement.definitionRule.dottedName}'`
				)}
					`,
				{ rule: node.contextDottedName }
			)
		}
	}

	const applicableReplacementsCacheKey = applicableReplacements
		.map((n) => n.remplacementRuleId)
		.join('-')

	cache[applicableReplacementsCacheKey] ??= {
		nodeKind: 'variations',
		sourceMap: {
			mecanismName: 'replacement',
		},
		rawNode: node.rawNode,
		explanation: [
			...applicableReplacements.map((replacement) => ({
				condition: replacement.definitionRule,
				consequence: replacement.replacementNode,
			})),
			{
				condition: defaultNode(true),
				consequence: node,
			},
		],
	}
	return cache[applicableReplacementsCacheKey]
}
