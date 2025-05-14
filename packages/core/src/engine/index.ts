import {
	ParsedRules,
	Possibility,
	PublicodesError,
	PublicodesExpression,
	RawPublicodes,
	Situation,
} from '..'
import { makeASTVisitor } from '../AST'
import { Evaluation, type ASTNode, type EvaluatedNode } from '../AST/types'
import { experimentalRuleWarning, warning } from '../error'
import { evaluationFunctions } from '../evaluationFunctions'
import parsePublicodes, {
	Context,
	copyContext,
	createContext,
} from '../parsePublicodes'
import { type RuleNode } from '../rule'
import * as utils from '../ruleUtils'
import {
	computeTraversedVariableAfterEval,
	computeTraversedVariableBeforeEval,
	isTraversedVariablesBoundary,
} from '../traversedVariables'
import { weakCopyObj } from '../utils'
import { isAValidOption } from './isAValidOption'
import { Cache, EngineOptions } from './types'

const emptyCache = (): Cache => ({
	_meta: {
		evaluationRuleStack: [],
		parentRuleStack: [],
	},
	traversedVariablesStack: undefined,
	nodes: new Map(),
})
/**
 * The engine is used to parse rules and evaluate expressions.
 * It is the main entry point to the publicodes library.
 *
 * @typeParam RuleNames - All rules names. Allows to automatically autocomplete rules names in the engine when using {@link Engine.getRule} or {@link Engine.setSituation}
 *
 */
export class Engine<RuleNames extends string = string> {
	/**@internal */
	baseContext: Context<RuleNames>
	/**@internal */
	context: Context<string>
	/**@internal */
	publicParsedRules: ParsedRules<RuleNames>
	/**@internal */
	publicSituation: Situation<RuleNames>

	/**@internal */
	cache: Cache = emptyCache()

	/**
	 * Creates an evaluation engine with the publicode rules given as arguments.

	 * @param rules The publicodes model to use ({@link RawPublicodes} or {@link ParsedRules})
	 * @param options Configuration options
	 */
	constructor(
		rules: RawPublicodes<RuleNames> | ParsedRules<RuleNames> = {},
		options: EngineOptions = {},
	) {
		const strict = options.strict
		const warn = options.warn
		const initialContext = {
			dottedName: '' as never,
			...options,
			flag: {
				filterNotApplicablePossibilities:
					options.flag?.filterNotApplicablePossibilities ?? false,
			},
			strict:
				typeof strict === 'boolean' ?
					{
						situation: strict,
						noOrphanRule: options.allowOrphanRules === true ? false : strict,
						checkPossibleValues: strict,
						noCycleRuntime: strict,
					}
				: typeof strict === 'object' ? strict
				: {},
			warn:
				typeof warn === 'boolean' ?
					{
						cyclicReferences: warn,
						experimentalRules: warn,
						unitConversion: warn,
					}
				: typeof warn === 'object' ? warn
				: {},
		}
		this.baseContext = createContext({
			...initialContext,
			...parsePublicodes(rules as RawPublicodes<RuleNames>, initialContext),
		})
		this.context = copyContext(this.baseContext)

		this.publicParsedRules = {} as ParsedRules<RuleNames>
		for (const name in this.baseContext.parsedRules) {
			const rule = this.baseContext.parsedRules[name]
			if (
				!(rule as RuleNode).private &&
				utils.isAccessible(this.baseContext.parsedRules, '', name)
			) {
				this.publicParsedRules[name] = rule as RuleNode<RuleNames>
			}
		}

		this.publicSituation = {} as Situation<RuleNames>
	}

	/**
	 * Reset the engine cache. This will clear all the cached evaluations.
	 */
	resetCache() {
		this.cache = emptyCache()
		this.context.subEngines = new Map()
	}

	/**
	 * Set the situation used for the evaluation.
	 *
	 * All subsequent evaluations will use this situation.
	 * Reset the evaluation cache to avoid inconsistencies, so it is costly to call this method frequently with the same situation.
	 */
	setSituation(
		/**
		 * The situation to set (see {@link Situation})
		 */
		situation: Situation<RuleNames> = {},
		options: {
			/**
			 * If true, the previous situation is kept and the new values are added to it.
			 * @default false
			 */
			keepPreviousSituation?: boolean
			/**
			 * If set to true, the engine will throw when the
			 * situation contains invalid values
			 * (rules that don't exists, or values with syntax errors).
			 *
			 * If set to false, it will log the error and filter the invalid values from the situation
			 *
			 * Overrides the {@link EngineOptions} strict option
			 */
			strict?: boolean
		} = {},
	) {
		this.resetCache()

		const keepPreviousSituation = options.keepPreviousSituation ?? false

		const strictMode = options.strict || this.baseContext.strict.situation

		let situationRules = Object.entries(situation).filter(
			([dottedName, value]) => {
				const error = this.checkSituationRule(
					dottedName as RuleNames,
					value as PublicodesExpression | ASTNode,
				)
				if (!error) return true
				if (strictMode || this.baseContext.strict.checkPossibleValues) {
					throw error
				}
				warning(this.context, error.message, 'situationIssues')
				return false
			},
		)

		const previousContext = this.context
		if (!keepPreviousSituation) {
			this.context = copyContext(this.baseContext)
			this.publicSituation = {}
		}

		if (strictMode) {
			// With strict mode, we parse everything at once to improve performance,
			// as the first error will stop the process anyway
			const error = this.parseSituationRules(situationRules)
			if (error) {
				this.context = previousContext
				throw error
			}
		} else {
			// With strict mode off, we filter out the rules that throw an error during parsing
			// So we need to parse them one by one
			situationRules = situationRules.filter((situationRule) => {
				const error = this.parseSituationRules([situationRule])
				if (error) {
					warning(this.context, error.message, 'situationIssues')
				}
				return !error
			})
		}

		this.publicSituation = Object.assign(
			this.publicSituation,
			Object.fromEntries(situationRules),
		)
		if (this.context.warn.experimentalRules) {
			Object.keys(this.publicSituation).forEach((nom) => {
				if (utils.isExperimental(this.context.parsedRules, nom)) {
					experimentalRuleWarning(this.context, nom)
				}
				this.checkExperimentalRule(
					this.context.parsedRules[`${nom} . $SITUATION`],
				)
			})
		}

		return this
	}

	/**
	 *
	 * @returns true if the engine has encountered an inversion error during the last evaluation
	 */
	inversionFail(): boolean {
		return !!this.cache.inversionFail
	}

	/**
	 * Get the rule with the given dottedName.
	 * @param dottedName
	 *
	 * @throws PublicodesError if the rule does not exist or is private
	 */
	getRule(dottedName: RuleNames): RuleNode<RuleNames> {
		if (!(dottedName in this.baseContext.parsedRules)) {
			throw new PublicodesError(
				'UnknownRule',
				`La règle '${dottedName}' n'existe pas`,
				{ dottedName },
			)
		}

		if (!(dottedName in this.publicParsedRules)) {
			throw new PublicodesError(
				'PrivateRule',
				`La règle ${dottedName} est une règle privée.`,
				{ dottedName },
			)
		}

		return this.publicParsedRules[dottedName] as RuleNode<RuleNames>
	}

	/**
	 *
	 * @returns the parsed rules used by the engine
	 *
	 * @remarks The private rules are not included in the parsed rules
	 */
	getParsedRules(): ParsedRules<RuleNames> {
		return this.publicParsedRules
	}

	/**
	 * Retrieve the current situation used for the evaluation
	 *
	 * This situation can be slightly different from the one set with
	 * {@link setSituation} if some values were filtered out because of
	 * evaluation errors.
	 *
	 * @returns {@link Situation} used by the engine
	 */
	getSituation(): Situation<RuleNames> {
		return this.publicSituation
	}

	/**
	 * Retrieves the list of possible values for a given rule.
	 *
	 * @param dottedName - The dotted name of the rule to get possibilities for
	 * @param options - Options object
	 * @param options.filterNotApplicable - When true, filters out possibilities that are not applicable based on the current situation. Defaults to false.
	 * @returns Array of possibility nodes if the rule has possibilities defined, null otherwise
	 *
	 * @example
	 * **Publicodes**
	 * ```yaml
	 * contrat:
	 *  une possibilité:
	 *   - "'CDI'"
	 *   - "'CDD'"
	 * ```js
	 * engine.getPossibilitiesFor('contrat')
	 *
	 * ```
	 */
	getPossibilitiesFor(
		dottedName: RuleNames,
		{
			filterNotApplicable = false,
		}: {
			filterNotApplicable?: boolean
		} = {},
	): Array<Possibility> | null {
		if (
			!this.context.flag?.filterNotApplicablePossibilities &&
			filterNotApplicable
		) {
			throw new PublicodesError(
				'EngineError',
				'You must enable `flag.filterNotApplicablePossibilities` in engine instantiation to use the filterNotApplicable option',
				{},
			)
		}
		const rule = this.getRule(dottedName)
		if (!rule.possibilities) {
			return null
		}
		if (filterNotApplicable) {
			return (
				this.evaluateNode(rule.possibilities).explanation as Array<
					Possibility & {
						notApplicable: { nodeValue: Evaluation }
					}
				>
			).filter((possibility) => possibility.notApplicable?.nodeValue !== true)
		}
		return rule.possibilities.explanation
	}

	/**
	 * Evaluate a publicodes expression.
	 *
	 * Use the current situation set by {@link setSituation}.
	 *
	 * @remarks
	 * 	To improve performance, the engine will cache the evaluation of the expression,
	 * 	and all its byproducts (intermediate evaluations).
	 * 	The cache is reset when the situation is updated with {@link setSituation}.
	 * 	You can also manually reset it with {@link resetCache}.
	 *
	 * @param value - The publicodes expression to evaluate.
	 * @returns The {@link ASTNode} of the publicodes expression decorated with evaluation results (nodeValue, unit, missingVariables, etc.)
	 *
	 */
	evaluate(value: PublicodesExpression | ASTNode): EvaluatedNode {
		const cachedNode = this.cache.nodes.get(value)
		if (cachedNode) {
			return cachedNode
		}
		this.context = Object.assign(
			this.context,
			parsePublicodes(
				{
					'[privé] $EVALUATION':
						value && typeof value === 'object' && 'nodeKind' in value ?
							{ valeur: value }
						:	value,
				},
				this.context,
			),
		)
		this.checkExperimentalRule(this.context.parsedRules['$EVALUATION'])
		this.cache._meta = emptyCache()._meta

		const evaluation = this.evaluateNode(
			this.context.parsedRules['$EVALUATION'].explanation.valeur,
		)
		this.cache.nodes.set(value, evaluation)
		return evaluation
	}

	/**@internal */
	evaluateNode<T extends ASTNode>(parsedNode: T): EvaluatedNode & T {
		const cachedNode = this.cache.nodes.get(parsedNode)
		let traversedVariableBoundary: boolean = false
		if (this.cache.traversedVariablesStack) {
			traversedVariableBoundary = isTraversedVariablesBoundary(
				this.cache.traversedVariablesStack,
				parsedNode,
			)
			computeTraversedVariableBeforeEval(
				this.cache.traversedVariablesStack,
				parsedNode,
				cachedNode,
				this.publicParsedRules,
				traversedVariableBoundary,
			)
		}

		if (cachedNode !== undefined) {
			return cachedNode
		}

		if (!evaluationFunctions[parsedNode.nodeKind]) {
			throw new PublicodesError(
				'EvaluationError',
				`Unknown "nodeKind": ${parsedNode.nodeKind}`,
				{ dottedName: '' },
			)
		}

		const evaluatedNode = evaluationFunctions[parsedNode.nodeKind].call(
			this,
			parsedNode,
		)
		if (this.cache.traversedVariablesStack) {
			computeTraversedVariableAfterEval(
				this.cache.traversedVariablesStack,
				evaluatedNode,
				traversedVariableBoundary,
			)
		}

		this.cache.nodes.set(parsedNode, evaluatedNode)
		return evaluatedNode
	}

	/**
	 * Shallow Engine instance copy. Useful to evaluate the same rules with different situations.
	 *
	 * @returns a new Engine instance with the same baseContext, context, publicParsedRules, publicSituation and cache attributes.
	 */
	shallowCopy(): Engine<RuleNames> {
		const newEngine = new Engine<RuleNames>()
		newEngine.baseContext = copyContext(this.baseContext)
		newEngine.context = copyContext(this.context)
		newEngine.publicParsedRules = this.publicParsedRules
		newEngine.publicSituation = weakCopyObj(this.publicSituation)
		newEngine.cache = {
			...emptyCache(),
			nodes: new Map(this.cache.nodes),
		}
		return newEngine
	}

	private checkExperimentalRule = makeASTVisitor((node) => {
		if (
			node.nodeKind === 'reference' &&
			utils.isExperimental(this.context.parsedRules, node.dottedName as string)
		) {
			experimentalRuleWarning(this.baseContext, node.dottedName as string)
		}
		return 'continue'
	})

	private checkSituationRule(
		dottedName: RuleNames,
		value: PublicodesExpression | ASTNode,
	): false | PublicodesError<'SituationError'> {
		// We check if the dotteName is a rule of the model
		if (!(dottedName in this.baseContext.parsedRules)) {
			const errorMessage = `'${dottedName}' n'existe pas dans la base de règle.`

			return new PublicodesError('SituationError', errorMessage, {
				dottedName,
			})
		}
		const rule = this.baseContext.parsedRules[dottedName]
		if (rule.private) {
			const errorMessage = `La règle ${dottedName} est une règle privée.`
			return new PublicodesError('SituationError', errorMessage, { dottedName })
		}
		if (
			rule.possibilities &&
			!isAValidOption(this, rule.possibilities, this.evaluate(value))
		) {
			const errorMessage = `La valeur "${this.evaluate(value).nodeValue}" ne fait pas partie des possibilités applicables listées pour cette règle.`

			return new PublicodesError('SituationError', errorMessage, {
				dottedName,
			})
		}

		return false
	}

	private parseSituationRules(
		situation: Array<[dottedName: string, value: unknown]>,
	): false | PublicodesError<'SituationError'> {
		const situationToParse = Object.fromEntries(
			situation.map(([dottedName, value]) => [
				`[privé] ${dottedName} . $SITUATION`,
				value && typeof value === 'object' && 'nodeKind' in value ?
					{ valeur: value }
				:	value,
			]),
		) as RawPublicodes<RuleNames>
		try {
			const newContext = parsePublicodes(situationToParse, this.context)
			this.context = Object.assign(this.context, newContext)
			return false
		} catch (error) {
			let message: string = ''
			let dottedName: string | undefined
			if (!(error instanceof Error)) {
				throw error
			}

			message = error.message

			if ('dottedName' in error) {
				dottedName = error.dottedName as string
			}

			return new PublicodesError('SituationError', message, {
				dottedName: dottedName ?? '',
			})
		}
	}
}
