import yaml from 'yaml'
import { Logger, ParsedRules } from '.'
import { makeASTTransformer, traverseParsedRules } from './AST'
import inferNodeType, { NodesTypes } from './inferNodeType'
import parse from './parse'
import { inlineReplacements, ReplacementRule } from './replacement'
import { Rule } from './rule'
import {
	disambiguateReferenceNode,
	updateReferencesMapsFromReferenceNode,
} from './ruleUtils'
import { getUnitKey } from './units'

export type Context<RuleNames extends string = string> = {
	dottedName: RuleNames | ''
	parsedRules: ParsedRules<RuleNames>
	nodesTypes: NodesTypes
	referencesMaps: ReferencesMaps<RuleNames>
	rulesReplacements: RulesReplacements<RuleNames>
	getUnitKey?: getUnitKey
	logger: Logger
	inversionMaxIterations?: number
}

export type RulesReplacements<RuleNames extends string> = Partial<
	Record<RuleNames, ReplacementRule[]>
>

export type ReferencesMaps<Names extends string> = {
	referencesIn: Map<Names, Set<Names>>
	rulesThatUse: Map<Names, Set<Names>>
}

type RawRule = Omit<Rule, 'nom'> | string | number
export type RawPublicodes<RuleNames extends string> = Partial<
	Record<RuleNames, RawRule>
>

export function createContext<RuleNames extends string>(
	partialContext: Partial<Context<RuleNames>>
): Context<RuleNames> {
	return {
		dottedName: '',
		logger: console,
		getUnitKey: (x) => x,
		parsedRules: {} as ParsedRules<RuleNames>,
		referencesMaps: { referencesIn: new Map(), rulesThatUse: new Map() },
		nodesTypes: new WeakMap(),
		rulesReplacements: {},

		...partialContext,
	}
}

export function copyContext<C extends Context>(context: C): C {
	return {
		...context,
		parsedRules: { ...context.parsedRules },
		referencesMaps: {
			referencesIn: new Map(context.referencesMaps.referencesIn),
			rulesThatUse: new Map(context.referencesMaps.rulesThatUse),
		},
	}
}
export default function parsePublicodes<
	ContextNames extends string,
	NewRulesNames extends string
>(
	rawRules: RawPublicodes<NewRulesNames> | string,
	partialContext: Partial<Context<ContextNames>> = createContext({})
): Pick<
	Context<ContextNames | NewRulesNames>,
	'parsedRules' | 'nodesTypes' | 'referencesMaps' | 'rulesReplacements'
> {
	// STEP 1: parse Yaml
	let rules =
		typeof rawRules === 'string'
			? (yaml.parse(
					('' + rawRules).replace(/\t/g, '  ')
			  ) as RawPublicodes<NewRulesNames>)
			: { ...rawRules }

	// STEP 2: Rules parsing
	const context = createContext(partialContext)
	let previousParsedRules = context.parsedRules
	context.parsedRules = {} as ParsedRules<ContextNames>

	Object.entries(rules).forEach(([dottedName, rule]) => {
		if (typeof rule === 'string' || typeof rule === 'number') {
			rule = {
				valeur: `${rule}`,
			}
		}
		if (typeof rule !== 'object') {
			throw new SyntaxError(
				`Rule ${dottedName} is incorrectly written. Please give it a proper value.`
			)
		}
		parse({ nom: dottedName, ...rule }, context)
	})

	let parsedRules = Object.assign(
		previousParsedRules,
		context.parsedRules
	) as ParsedRules<NewRulesNames | ContextNames>

	// STEP 3: Disambiguate reference
	let [newRules, referencesMaps] = disambiguateReferencesAndCollectDependencies(
		parsedRules,
		context.parsedRules,
		context.referencesMaps
	)

	// STEP 4: Inline replacements
	let rulesReplacements
	;[parsedRules, rulesReplacements] = inlineReplacements<
		NewRulesNames,
		ContextNames
	>({
		parsedRules,
		newRules: newRules as any,
		referencesMaps,
		previousReplacements: context.rulesReplacements,
		logger: context.logger,
	})

	// STEP 5: type inference
	const nodesTypes = inferNodeType(
		Object.keys(newRules),
		parsedRules,
		context.nodesTypes
	)

	return {
		parsedRules,
		nodesTypes,
		referencesMaps,
		rulesReplacements,
	}
}

function disambiguateReferencesAndCollectDependencies<
	NewNames extends string,
	PreviousNames extends string
>(
	parsedRules: ParsedRules<PreviousNames>,
	newRules: ParsedRules<NewNames>,
	referencesMaps: ReferencesMaps<PreviousNames>
): [
	parsedRules: ParsedRules<NewNames>,
	referencesMap: ReferencesMaps<PreviousNames | NewNames>
] {
	const disambiguateReference = makeASTTransformer((node) =>
		disambiguateReferenceNode(node, parsedRules)
	)
	const disambiguateReferencesAndCollectDependencies = makeASTTransformer(
		(node) => {
			const n = disambiguateReferenceNode(node, parsedRules)
			if (n) {
				updateReferencesMapsFromReferenceNode(n, referencesMaps)
			}
			return n
		}
	)
	const disambiguatedRules = traverseParsedRules((node) => {
		if (node.nodeKind === 'replacementRule') {
			// The dependencies of replacements will be collected later, during the inlining
			return disambiguateReference(node)
		}
		return disambiguateReferencesAndCollectDependencies(node)
	}, newRules)
	return [
		disambiguatedRules,
		referencesMaps as ReferencesMaps<NewNames | PreviousNames>,
	]
}
