import { type ASTNode, type EvaluatedNode, type NodeKind } from './AST/types'
import { evaluationFunctions } from './evaluationFunctions'
import parsePublicodes, {
	Context,
	copyContext,
	createContext,
	RawPublicodes,
} from './parsePublicodes'
import { type Rule, type RuleNode } from './rule'
import * as utils from './ruleUtils'

const emptyCache = (): Cache => ({
	_meta: {
		evaluationRuleStack: [],
		parentRuleStack: [],
		traversedVariablesStack: [],
	},
	nodes: new Map(),
})

type Cache = {
	_meta: {
		evaluationRuleStack: Array<string>
		parentRuleStack: Array<string>
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
		traversedVariablesStack: Array<Set<string>>
		inversionFail?:
			| {
					given: string
					estimated: string
			  }
			| true
		currentRecalcul?: ASTNode
	}
	nodes: Map<PublicodesExpression | ASTNode, EvaluatedNode>
}

export type EvaluationOptions = Partial<{
	unit: string
}>

export {
	makeASTTransformer as transformAST,
	reduceAST,
	traverseASTNode,
} from './AST/index'
export { type Evaluation, type Unit } from './AST/types'
export { capitalise0, formatValue } from './format'
export { simplifyNodeUnit } from './nodeUnits'
export { default as serializeEvaluation } from './serializeEvaluation'
export { parseUnit, serializeUnit } from './units'
export { parsePublicodes, utils }
export { type Rule, type RuleNode, type ASTNode, type EvaluatedNode }

export type PublicodesExpression = string | Record<string, unknown> | number

export type Logger = {
	log(message: string): void
	warn(message: string): void
	error(message: string): void
}

type Options = Partial<Pick<Context, 'logger' | 'getUnitKey'>>

export type EvaluationFunction<Kind extends NodeKind = NodeKind> = (
	this: Engine,
	node: ASTNode & { nodeKind: Kind }
) => ASTNode & { nodeKind: Kind } & EvaluatedNode

export type ParsedRules<Name extends string> = Record<
	Name,
	RuleNode & { dottedName: Name }
>

export default class Engine<Name extends string = string> {
	baseContext: Context<Name>
	context: Context<string>
	publicParsedRules: ParsedRules<Name>

	cache: Cache = emptyCache()

	// The subEngines attribute is used to get an outside reference to the
	// recalcul intermediate calculations. The recalcul mechanism uses
	// `shallowCopy` to instanciate a new engine, and we want to keep a reference
	// to it for the documentation.
	//
	// TODO: A better implementation would to remove the "runtime" concept of
	// "subEngines" and instead duplicate all rules names in the scope of the
	// recalcul as described in
	// https://github.com/betagouv/publicodes/discussions/92
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

		this.publicParsedRules = Object.fromEntries(
			Object.entries(this.baseContext.parsedRules).filter(
				([name, rule]) =>
					!(rule as RuleNode).private &&
					utils.isAccessible(this.baseContext.parsedRules, '', name)
			)
		) as ParsedRules<Name>
	}

	resetCache() {
		this.cache = emptyCache()
	}

	setSituation(
		situation: Partial<Record<Name, PublicodesExpression | ASTNode>> = {},
		options: { keepPreviousSituation?: boolean } = {}
	) {
		this.resetCache()

		const keepPreviousSituation = options.keepPreviousSituation ?? false

		Object.keys(situation).forEach((name) => {
			if (!(name in this.baseContext.parsedRules)) {
				throw new Error(
					`Erreur lors de la mise à jour de la situation : ${name} n'existe pas dans la base de règle.`
				)
			}
			if (this.baseContext.parsedRules[name].private) {
				throw new Error(
					`Erreur lors de la mise à jour de la situation : ${name} est une règle privée (il n'est pas possible de modifier une règle privée).`
				)
			}
		})

		// The situation is implemented as a special sub namespace `$SITUATION`,
		// present on each non-private rules
		const situationToParse = Object.fromEntries(
			Object.entries(situation).map(([nom, value]) => [
				`[privé] ${nom} . $SITUATION`,
				value && typeof value === 'object' && 'nodeKind' in value
					? { valeur: value }
					: value,
			])
		)

		const savedBaseContext = copyContext(this.baseContext)

		// const previousParsedRules = this.context.
		this.context = {
			...this.baseContext,
			...parsePublicodes(
				situationToParse as RawPublicodes<Name>,
				keepPreviousSituation ? this.context : this.baseContext
			),
		}
		this.baseContext = savedBaseContext

		return this
	}

	inversionFail(): boolean {
		return !!this.cache._meta.inversionFail
	}

	getRule(dottedName: Name): ParsedRules<Name>[Name] {
		if (!(dottedName in this.baseContext.parsedRules)) {
			throw new Error(`La règle '${dottedName}' n'existe pas`)
		}

		if (!(dottedName in this.publicParsedRules)) {
			throw new Error(`La règle ${dottedName} est une règle privée.`)
		}
		return this.publicParsedRules[dottedName]
	}

	getParsedRules(): ParsedRules<Name> {
		return this.publicParsedRules
	}

	evaluate(value: PublicodesExpression): EvaluatedNode {
		const cachedNode = this.cache.nodes.get(value)
		if (cachedNode) {
			return cachedNode
		}
		this.context = {
			...this.context,
			...parsePublicodes(
				{
					'[privé] $EVALUATION':
						value && typeof value === 'object' && 'nodeKind' in value
							? { valeur: value }
							: value,
				},
				this.context
			),
		}
		this.cache._meta = emptyCache()._meta
		const evaluation = this.evaluateNode(
			this.context.parsedRules['$EVALUATION'].explanation.valeur
		)
		this.cache.nodes.set(value, evaluation)
		return evaluation
	}

	evaluateNode<T extends ASTNode>(parsedNode: T): EvaluatedNode & T {
		const cachedNode = this.cache.nodes.get(parsedNode)
		if (cachedNode !== undefined) {
			cachedNode.traversedVariables?.forEach((name) =>
				this.cache._meta.traversedVariablesStack[0]?.add(name)
			)
			return cachedNode
		}

		if (!evaluationFunctions[parsedNode.nodeKind]) {
			throw Error(`Unknown "nodeKind": ${parsedNode.nodeKind}`)
		}

		const isTraversedVariablesBoundary =
			this.cache._meta.traversedVariablesStack.length === 0 ||
			parsedNode.nodeKind === 'rule'

		if (isTraversedVariablesBoundary) {
			// Note: we use `unshift` instead of the more usual `push` to reverse the
			// order of the elements in the stack. This simplify access to the “top
			// element” with [0], instead of [length - 1]. We could also use the new
			// method `.at(-1)` but it isn't supported below Node v16.
			this.cache._meta.traversedVariablesStack.unshift(new Set())
		}

		if (
			parsedNode.nodeKind === 'reference' &&
			parsedNode.dottedName &&
			parsedNode.dottedName in this.publicParsedRules
		) {
			this.cache._meta.traversedVariablesStack[0].add(parsedNode.dottedName)
		}

		const evaluatedNode = evaluationFunctions[parsedNode.nodeKind].call(
			this,
			parsedNode
		)

		if (isTraversedVariablesBoundary) {
			evaluatedNode.traversedVariables = Array.from(
				this.cache._meta.traversedVariablesStack.shift() ?? []
			)

			if (this.cache._meta.traversedVariablesStack.length > 0) {
				evaluatedNode.traversedVariables.forEach((name) => {
					this.cache._meta.traversedVariablesStack[0].add(name)
				})
			}
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
}

/**
 	This function allows to mimic the former 'isApplicable' property on evaluatedRules
	@deprecated
*/
export function UNSAFE_isNotApplicable<DottedName extends string = string>(
	engine: Engine<DottedName>,
	dottedName: DottedName
): boolean | undefined {
	console.warn('UNSAFE_isNotApplicable est déprécié')
	console.warn('Utilisez le mécanisme "est non applicable" à la place.')
	return engine.evaluate({ 'est non applicable': dottedName }).nodeValue as
		| boolean
		| undefined
}
