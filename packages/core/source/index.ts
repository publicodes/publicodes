import { type ASTNode, type EvaluatedNode, type NodeKind } from './AST/types'
import { evaluationFunctions } from './evaluationFunctions'
import parse from './parse'
import parsePublicodes, {
	disambiguateReferenceAndCollectDependencies,
	InferedType,
} from './parsePublicodes'
import {
	getReplacements,
	inlineReplacements,
	type ReplacementRule,
} from './replacement'
import { type Rule, type RuleNode } from './rule'
import * as utils from './ruleUtils'
import { formatUnit, getUnitKey } from './units'

const emptyCache = (): Cache => ({
	_meta: {
		evaluationRuleStack: [],
		parentRuleStack: [],
	},
	nodes: new Map(),
	nodesApplicability: new Map(),
})

type Cache = {
	_meta: {
		evaluationRuleStack: Array<string>
		parentRuleStack: Array<string>
		inversionFail?:
			| {
					given: string
					estimated: string
			  }
			| true
		currentRecalcul?: ASTNode
		filter?: string
	}
	nodes: Map<PublicodesExpression | ASTNode, EvaluatedNode>
	nodesApplicability: Map<PublicodesExpression | ASTNode, EvaluatedNode>
}

export type EvaluationOptions = Partial<{
	unit: string
}>

export { makeASTTransformer as transformAST, reduceAST } from './AST/index'
export {
	isNotApplicable,
	isNotYetDefined,
	type Evaluation,
	type NotApplicable,
	type NotYetDefined,
	type Unit,
} from './AST/types'
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

type Options = {
	logger: Logger
	getUnitKey?: getUnitKey
	formatUnit?: formatUnit
	inversionMaxIterations?: number
}

export type EvaluationFunction<Kind extends NodeKind = NodeKind> = (
	this: Engine,
	node: ASTNode & { nodeKind: Kind }
) => ASTNode & { nodeKind: Kind } & EvaluatedNode

export type ParsedRules<Name extends string> = Record<
	Name,
	RuleNode & { dottedName: Name }
>

export default class Engine<Name extends string = string> {
	parsedRules: ParsedRules<Name>
	parsedSituation: Record<string, ASTNode> = {}
	replacements: Record<string, Array<ReplacementRule>> = {}
	cache: Cache = emptyCache()
	options: Options

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
	ruleUnits: WeakMap<ASTNode, InferedType>

	constructor(
		rules: string | Record<string, Rule> = {},
		options: Partial<Options> = {}
	) {
		this.options = { ...options, logger: options.logger ?? console }
		const { parsedRules, ruleUnits } = parsePublicodes<Name>(
			rules,
			this.options
		)
		this.parsedRules = parsedRules
		this.ruleUnits = ruleUnits
		this.replacements = getReplacements(this.parsedRules)
	}

	setOptions(options: Partial<Options>) {
		this.options = { ...this.options, ...options }
	}

	resetCache() {
		this.cache = emptyCache()
	}

	setSituation(
		situation: Partial<Record<Name, PublicodesExpression | ASTNode>> = {}
	) {
		this.resetCache()
		this.parsedSituation = Object.fromEntries(
			Object.entries(situation).map(([key, value]) => {
				if (value && typeof value === 'object' && 'nodeKind' in value) {
					return [key, value as ASTNode]
				}
				const parsedValue =
					value && typeof value === 'object' && 'nodeKind' in value
						? (value as ASTNode)
						: this.parse(value, {
								dottedName: `situation [${key}]`,
								parsedRules: {},
								...this.options,
						  })
				return [key, parsedValue]
			})
		)
		return this
	}

	private parse(...args: Parameters<typeof parse>) {
		return inlineReplacements(
			this.replacements,
			this.options.logger
		)(
			disambiguateReferenceAndCollectDependencies(
				this.parsedRules,
				{}
			)(parse(...args))
		)
	}

	inversionFail(): boolean {
		return !!this.cache._meta.inversionFail
	}

	getRule(dottedName: Name): ParsedRules<Name>[Name] {
		if (!(dottedName in this.parsedRules)) {
			throw new Error(`La règle '${dottedName}' n'existe pas`)
		}
		return this.parsedRules[dottedName]
	}

	getParsedRules(): ParsedRules<Name> {
		return this.parsedRules
	}

	getOptions(): Options {
		return this.options
	}

	evaluate<N extends ASTNode = ASTNode>(value: N): N & EvaluatedNode
	evaluate(value: PublicodesExpression): EvaluatedNode
	evaluate(value: PublicodesExpression | ASTNode): EvaluatedNode {
		const cachedNode = this.cache.nodes.get(value)

		if (cachedNode !== undefined) {
			return cachedNode
		}

		let parsedNode: ASTNode
		if (!value || typeof value !== 'object' || !('nodeKind' in value)) {
			parsedNode = this.parse(value, {
				dottedName: 'evaluation',
				parsedRules: {},
				...this.options,
			})
		} else {
			parsedNode = value as ASTNode
		}

		if (!evaluationFunctions[parsedNode.nodeKind]) {
			throw Error(`Unknown "nodeKind": ${parsedNode.nodeKind}`)
		}

		const evaluatedNode = evaluationFunctions[parsedNode.nodeKind].call(
			this,
			parsedNode
		)

		this.cache.nodes.set(value, evaluatedNode)

		return evaluatedNode
	}

	/**
	 * Shallow Engine instance copy. Keeps references to the original Engine instance attributes.
	 */
	shallowCopy(): Engine<Name> {
		const newEngine = new Engine<Name>()
		newEngine.options = this.options
		newEngine.parsedRules = this.parsedRules
		newEngine.replacements = this.replacements
		newEngine.parsedSituation = this.parsedSituation
		newEngine.ruleUnits = this.ruleUnits
		newEngine.cache = this.cache
		newEngine.subEngineId = this.subEngines.length
		this.subEngines.push(newEngine)
		return newEngine
	}
}

/**
 	This function allows to mimic the former 'isApplicable' property on evaluatedRules

	It will be deprecated when applicability will be encoded as a Literal type
*/
export function UNSAFE_isNotApplicable<DottedName extends string = string>(
	engine: Engine<DottedName>,
	dottedName: DottedName
): boolean {
	return (
		engine.ruleUnits.get(engine.parsedRules[dottedName] as any)?.isNullable ===
			true && engine.evaluate(dottedName).nodeValue === null
	)
}
