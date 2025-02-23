import Engine, {
	Logger,
	ParsedRules,
	PublicodesExpression,
	RawPublicodes,
	StrictOptions,
} from '.'
import { makeASTTransformer, traverseParsedRules } from './AST'
import { PublicodesError } from './error'
import inferNodeType, { NodesTypes } from './inferNodeType'
import { ReplacementRule, inlineReplacements } from './parseReplacement'
import { Rule, parseRules } from './parseRule'
import {
	disambiguateReferenceNode,
	updateReferencesMapsFromReferenceNode,
} from './ruleUtils'
import { getUnitKey } from './units'
import { weakCopyObj } from './utils'

export type Context<RuleNames extends string = string> = {
	dottedName: RuleNames | ''
	parsedRules: ParsedRules<RuleNames>
	nodesTypes: NodesTypes
	referencesMaps: ReferencesMaps<RuleNames>
	rulesReplacements: RulesReplacements<RuleNames>
	logger: Logger
	inversionMaxIterations?: number

	/**
	 * This is used to generate unique IDs for sub-engines, we need to generate them at
	 *  */
	subEngineIncrementingNumber?: number

	strict: StrictOptions

	// The subEngines attribute is used to get an outside reference to the
	// `contexte` intermediate calculations. The `contexte` mechanism uses
	// `shallowCopy` to instanciate a new engine, and we want to keep a reference
	// to it for the documentation.
	//
	// TODO: A better implementation would to remove the "runtime" concept of
	// "subEngines" and instead duplicate all rules names in the scope of the
	// `contexte` as described in
	// https://github.com/publicodes/publicodes/discussions/92
	subEngines: Map<SituationHash, Engine<RuleNames>>
	subEngineId: SituationHash | undefined

	getUnitKey: getUnitKey
}

type SituationHash = number

export type RulesReplacements<RuleNames extends string> = Partial<
	Record<RuleNames, ReplacementRule[]>
>

export type ReferencesMaps<Names extends string> = {
	referencesIn: Map<Names, Set<Names>>
	rulesThatUse: Map<Names, Set<Names>>
}

export type RawRule = Omit<Rule, 'nom'> | PublicodesExpression

export function createContext<RuleNames extends string>(
	partialContext: Partial<Context<RuleNames>>,
): Context<RuleNames> {
	return {
		dottedName: '',
		logger: console,
		getUnitKey: (x) => x,
		parsedRules: {} as ParsedRules<RuleNames>,
		referencesMaps: { referencesIn: new Map(), rulesThatUse: new Map() },
		nodesTypes: new WeakMap(),
		rulesReplacements: {},
		subEngines: new Map(),
		subEngineId: undefined,
		strict: {
			situation: true,
			noOrphanRule: true,
			noCycleRuntime: false,
			checkPossibleValues: false,
			...partialContext.strict,
		},
		...partialContext,
	}
}

export function copyContext<C extends Context>(context: C): C {
	return Object.assign({}, context, {
		parsedRules: weakCopyObj(context.parsedRules),
		referencesMaps: {
			referencesIn: new Map(context.referencesMaps.referencesIn),
			rulesThatUse: new Map(context.referencesMaps.rulesThatUse),
		},
		subEngines: new Map(),
	})
}
/**
 * Parse a set of publicodes rules
 *
 * Allows to add new rules to a previously parsed set of rules (partialContext)
 *
 * @param rawRules - The new rules to parse
 * @param partialContext - The context to use for the parsing (if we want to add a set of rules to a previously parsed one)
 *
 * @returns The new context containing the parsed rules, the nodes types, the references maps and the rules replacements
 *
 * @experimental
 */
export default function parsePublicodes<
	ContextNames extends string,
	NewRulesNames extends string,
>(
	rawRules: RawPublicodes<NewRulesNames>,
	partialContext: Partial<Context<ContextNames>> = createContext({}),
): Pick<
	Context<ContextNames | NewRulesNames>,
	'parsedRules' | 'nodesTypes' | 'referencesMaps' | 'rulesReplacements'
> {
	// STEP 1 : get the rules as an object

	if (typeof rawRules === 'string')
		throw new PublicodesError(
			'EngineError',
			'Publicodes does not parse yaml rule sets itself anymore. Please provide a parsed js object. E.g. the `eemeli/yaml` package.',
			{},
		)

	// let rules = { ...rawRules } // take 7-8ms
	const rules = weakCopyObj(rawRules) // take 1-2ms

	// STEP 2: Rules parsing
	const context = createContext(partialContext)
	const previousParsedRules = context.parsedRules
	context.parsedRules = {} as ParsedRules<ContextNames>
	parseRules(rules, context)

	let parsedRules = {} as ParsedRules<NewRulesNames | ContextNames>
	for (const dottedName in previousParsedRules) {
		parsedRules[dottedName] = previousParsedRules[dottedName]
	}
	for (const dottedName in context.parsedRules) {
		parsedRules[dottedName] = context.parsedRules[dottedName]
	}

	// STEP 3: Disambiguate reference
	const [newRules, referencesMaps] =
		disambiguateReferencesAndCollectDependencies(
			parsedRules,
			context.parsedRules,
			context.referencesMaps,
			!context.strict.noOrphanRule,
		)

	// STEP 4: Inline replacements
	let rulesReplacements
		// eslint-disable-next-line prefer-const
	;[parsedRules, rulesReplacements] = inlineReplacements<
		NewRulesNames,
		ContextNames
	>({
		parsedRules,
		newRules: newRules as any,
		referencesMaps,
		previousReplacements: context.rulesReplacements,
	})

	// STEP 5: type inference
	const nodesTypes = inferNodeType(
		Object.keys(newRules),
		parsedRules,
		context.nodesTypes,
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
	PreviousNames extends string,
>(
	parsedRules: ParsedRules<PreviousNames>,
	newRules: ParsedRules<NewNames>,
	referencesMaps: ReferencesMaps<PreviousNames>,
	allowOrphanRules: boolean,
): [
	parsedRules: ParsedRules<NewNames>,
	referencesMap: ReferencesMaps<PreviousNames | NewNames>,
] {
	const disambiguateReference = makeASTTransformer((node) =>
		disambiguateReferenceNode(node, parsedRules),
	)
	const disambiguateReferencesAndCollectDependencies = makeASTTransformer(
		(node) => {
			const n = disambiguateReferenceNode(node, parsedRules)
			if (n) {
				updateReferencesMapsFromReferenceNode(n, referencesMaps)
			}
			return n
		},
	)
	const disambiguatedRules = traverseParsedRules((node) => {
		if (node.nodeKind === 'replacementRule') {
			// The dependencies of replacements will be collected later, during the inlining
			return disambiguateReference(node)
		}
		if (node.nodeKind === 'rule') {
			const parentUndefined = (node.explanation.parents as any).find(
				(n: any) => !(n.dottedName in parsedRules),
			)
			if (!allowOrphanRules && parentUndefined) {
				throw new PublicodesError(
					'SyntaxError',
					`La règle parente "${parentUndefined.dottedName}" n'existe pas`,
					{
						dottedName: node.dottedName,
					},
				)
			}
		}
		return disambiguateReferencesAndCollectDependencies(node)
	}, newRules)
	return [
		disambiguatedRules,
		referencesMaps as ReferencesMaps<NewNames | PreviousNames>,
	]
}
