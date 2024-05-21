import { makeASTVisitor } from './AST/index'
import { type ASTNode, type EvaluatedNode, type NodeKind } from './AST/types'
import { PublicodesError, experimentalRuleWarning, warning } from './error'
import { evaluationFunctions } from './evaluationFunctions'
import { parseExpression } from './parseExpression'
import parsePublicodes, {
	Context,
	RawPublicodes,
	copyContext,
	createContext,
} from './parsePublicodes'
import { type Rule, type RuleNode } from './rule'
import * as utils from './ruleUtils'
import {
	computeTraversedVariableAfterEval,
	computeTraversedVariableBeforeEval,
	isTraversedVariablesBoundary,
} from './traversedVariables'

const emptyCache = (): Cache => ({
	_meta: {
		evaluationRuleStack: [],
		parentRuleStack: [],
	},
	traversedVariablesStack: undefined,
	nodes: new Map(),
})

type Cache = {
	inversionFail?: boolean
	_meta: {
		evaluationRuleStack: Array<string>
		parentRuleStack: Array<string>
		currentContexteSituation?: string
	}
	/**
	 * Every time we encounter a reference to a rule in an expression we add it
	 * to the current Set of traversed variables. Because we evaluate the
	 * expression graph “top to bottom” (ie. we start by the high-level goal and
	 * recursively evaluate its dependencies), we need to handle rule
	 * “boundaries”, so that when we “enter” in the evaluation of a dependency,
	 * we start with a clear empty set of traversed variables. Then, when we go
	 * back to the referencer rule, we need to add all to merge the two sets :
	 * rules already traversed in the current expression and the one from the
	 * reference.
	 */
	traversedVariablesStack?: Array<Set<string>>
	nodes: Map<PublicodesExpression | ASTNode, EvaluatedNode>
}

export {
	reduceAST,
	makeASTTransformer as transformAST,
	traverseASTNode,
} from './AST/index'
export { type Evaluation, type Unit } from './AST/types'
export { PublicodesError, isPublicodesError } from './error'
export { capitalise0, formatValue } from './format'
export { simplifyNodeUnit } from './nodeUnits'
export { parseExpression, type ExprAST } from './parseExpression'
export { default as serializeEvaluation } from './serializeEvaluation'
export { parseUnit, serializeUnit } from './units'
export { parsePublicodes, utils }

export { type ASTNode, type EvaluatedNode, type Rule, type RuleNode }

export type PublicodesExpression = string | Record<string, unknown> | number

export type Logger = {
	log(message: string): void
	warn(message: string): void
	error(message: string): void
}

type Options = Partial<
	Pick<Context, 'logger' | 'getUnitKey' | 'allowOrphanRules' | 'safeMode'>
>

export type EvaluationFunction<Kind extends NodeKind = NodeKind> = (
	this: Engine,
	node: ASTNode & { nodeKind: Kind },
) => { nodeKind: Kind } & EvaluatedNode

export type ParsedRules<Name extends string> = Record<Name, RuleNode<Name>>

export type Situation<Name extends string> = Partial<
	Record<Name, PublicodesExpression | ASTNode>
>

export default class Engine<Name extends string = string> {
	baseContext: Context<Name>
	context: Context<string>
	publicParsedRules: ParsedRules<Name>
	publicSituation: Situation<Name>

	cache: Cache = emptyCache()

	// The subEngines attribute is used to get an outside reference to the
	// `contexte` intermediate calculations. The `contexte` mechanism uses
	// `shallowCopy` to instanciate a new engine, and we want to keep a reference
	// to it for the documentation.
	//
	// TODO: A better implementation would to remove the "runtime" concept of
	// "subEngines" and instead duplicate all rules names in the scope of the
	// `contexte` as described in
	// https://github.com/publicodes/publicodes/discussions/92
	subEngines: Array<Engine<Name>> = []
	subEngineId: number | undefined

	constructor(rules: RawPublicodes<Name> = {}, options: Options = {}) {
		const initialContext = {
			dottedName: '' as const,
			...options,
		}
		this.baseContext = createContext({
			...initialContext,
			...parsePublicodes<never, Name>(rules, initialContext),
		})
		this.context = this.baseContext

		this.publicParsedRules = {} as ParsedRules<Name>
		for (const name in this.baseContext.parsedRules) {
			const rule = this.baseContext.parsedRules[name]
			if (
				!(rule as RuleNode).private &&
				utils.isAccessible(this.baseContext.parsedRules, '', name)
			) {
				this.publicParsedRules[name] = rule as RuleNode<Name>
			}
		}

		this.publicSituation = {} as Situation<Name>
	}

	resetCache() {
		this.cache = emptyCache()
	}

	setSituation(
		situation: Situation<Name> = {},
		options: {
			keepPreviousSituation?: boolean
		} = {},
	) {
		this.resetCache()

		const keepPreviousSituation = options.keepPreviousSituation ?? false
		const safeMode = this.baseContext.safeMode ?? false

		const filteredSituation = this.safeGetSituation({
			situation,
			shouldThrowError: !safeMode,
		})

		this.publicSituation =
			keepPreviousSituation ?
				{ ...this.publicSituation, ...filteredSituation }
			:	filteredSituation

		Object.keys(this.publicSituation).forEach((name) => {
			if (this.baseContext.parsedRules[name].private) {
				throw new PublicodesError(
					'SituationError',
					`Erreur lors de la mise à jour de la situation : ${name} est une règle privée (il n'est pas possible de modifier une règle privée).`,
					{ dottedName: name },
				)
			}
		})

		// The situation is implemented as a special sub namespace `$SITUATION`,
		// present on each non-private rules
		const situationToParse = Object.fromEntries(
			Object.entries(this.publicSituation).map(([nom, value]) => [
				`[privé] ${nom} . $SITUATION`,
				value && typeof value === 'object' && 'nodeKind' in value ?
					{ valeur: value }
				:	value,
			]),
		)

		const savedBaseContext = copyContext(this.baseContext)

		try {
			this.context = {
				...this.baseContext,
				...parsePublicodes(
					situationToParse as RawPublicodes<Name>,
					keepPreviousSituation ? this.context : this.baseContext,
				),
			}
		} catch (error) {
			this.baseContext = savedBaseContext

			throw error
		}
		this.baseContext = savedBaseContext

		Object.keys(this.publicSituation).forEach((nom) => {
			if (utils.isExperimental(this.context.parsedRules, nom)) {
				experimentalRuleWarning(this.baseContext.logger, nom)
			}
			this.checkExperimentalRule(
				this.context.parsedRules[`${nom} . $SITUATION`],
			)
		})

		return this
	}

	inversionFail(): boolean {
		return !!this.cache.inversionFail
	}

	getRule(dottedName: Name): ParsedRules<Name>[Name] {
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

		return this.publicParsedRules[dottedName]
	}

	getParsedRules(): ParsedRules<Name> {
		return this.publicParsedRules
	}

	getSituation(): Situation<Name> {
		return this.publicSituation
	}

	safeGetSituation({
		situation,
		shouldThrowError = false,
	}: {
		situation: Situation<Name>
		shouldThrowError?: boolean
	}): Situation<Name> {
		const situationCopy = { ...situation }

		Object.keys(situation).forEach((name) => {
			// We check if the dotteName is a rule of the model
			if (!(name in this.baseContext.parsedRules)) {
				const errorMessage = `Erreur lors de la mise à jour de la situation : '${name}' n'existe pas dans la base de règle.`

				if (shouldThrowError === false) {
					warning(this.baseContext.logger, errorMessage, { dottedName: name })
					delete situationCopy[name]
				} else {
					throw new PublicodesError('SituationError', errorMessage, {
						dottedName: name,
					})
				}
			}

			// We check if the value from a mutliple choices question `dottedName`
			// is defined as a rule `dottedName . value` in the model.
			// If not, the value in the situation is an old option, that is not an option anymore.
			const parsedSituationExpr =
				typeof situation[name] === 'object' ?
					situation[name]
				:	parseExpression(situation[name], name)

			if (
				parsedSituationExpr?.constant?.type === 'string' &&
				!(
					`${name} . ${situation[name]?.replaceAll(/^'|'$/g, '')}` in
					this.baseContext.parsedRules
				) &&
				this.baseContext.parsedRules[name].explanation?.valeur?.rawNode?.[
					'une possibilité'
				]
			) {
				const errorMessage = `La valeur "${situation[name]}" de la règle '${name}' présente dans la situation n'existe pas dans la base de règle.`

				if (shouldThrowError === false) {
					warning(this.baseContext.logger, errorMessage, { dottedName: name })
					delete situationCopy[name]
				} else {
					throw new PublicodesError('SituationError', errorMessage, {
						dottedName: name,
					})
				}
			}
		})
		return situationCopy
	}

	evaluate(value: PublicodesExpression): EvaluatedNode {
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
	 * Shallow Engine instance copy. Keeps references to the original Engine instance attributes.
	 */
	shallowCopy(): Engine<Name> {
		const newEngine = new Engine<Name>()
		newEngine.baseContext = copyContext(this.baseContext)
		newEngine.context = copyContext(this.context)
		newEngine.publicParsedRules = this.publicParsedRules
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
			experimentalRuleWarning(
				this.baseContext.logger,
				node.dottedName as string,
			)
		}
		return 'continue'
	})
}
