import { Logger, PublicodesExpression } from '..'
import { type ASTNode, type EvaluatedNode } from '../AST/types'
import { getUnitKey } from '../units'

export type Cache = {
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

export type StrictOptions = {
	/**
	 * If set to true, the engine will throw when the
	 * situation contains invalid values
	 * (rules that don't exists, or values with syntax errors).
	 *
	 * If set to false, it will log the error and filter the invalid values from the situation
	 * @default true
	 */
	situation?: boolean

	/**
	 * If set to true, the engine will throw when parsing a rule whose parent doesn't exist
	 * This can be set to false to parse partial rule sets (e.g. optimized ones).
	 * @default true
	 */
	noOrphanRule?: boolean

	/**
	 * If set to true, the engine will throw when a cycle is detected at runtime
	 * @default false
	 */
	noCycleRuntime?: boolean

	/**
	 * If set to true, the engine will throw when a rule with 'une possibilité'
	 * is evaluated to a value that is not in the list.
	 * @default false
	 */
	checkPossibleValues?: boolean
}

export type FlagOptions = {
	/**
	 * When true, the engine will filter out possibilities that are not applicable based on the current situation.
	 * @default false
	 */
	filterNotApplicablePossibilities?: boolean
}

export type WarnOptions = {
	/**
	 * Enable warnings for experimental rules
	 * @default true
	 */
	experimentalRules?: boolean
	/**
	 * Enable warnings for unit conversion issues
	 * @default true
	 */
	unitConversion?: boolean
	/**
	 * Enable warnings for cyclic references in rules
	 * @default true
	 */
	cyclicReferences?: boolean
	/**
	 * Enable warnings for deprecated syntax
	 * @default true
	 */
	deprecatedSyntax?: boolean
	/**
	 * Enable warnings for situation issues. Warnings can be raised when the situation contains rules that are not in the base rules or when a value we try to set is not valid (it doesn't exist in the list of possible values for a given rule).
	 * @default true
	 */
	situationIssues?: boolean
}

/**
 * Options for the engine constructor
 */
export type EngineOptions = {
	/**
	 * Don't throw an error if the parent of a rule is not found.
	 * This is useful to parse partial rule sets (e.g. optimized ones).
	 * @deprecated Use the `strict: { parentRule: false }` option instead
	 */
	allowOrphanRules?: boolean
	/**
	 * Whether the engine should trigger an error when it detects an anomaly,
	 * or whether it should simply record it and continue.
	 *
	 * This option can be set globally (true or false) or for specific rules ({@link StrictOptions}).
	 *  */
	strict?: boolean | StrictOptions

	/**
	 * The logger used to log errors and warnings (default to console).
	 * @type {Logger}
	 */
	logger?: Logger

	/**
	 * getUnitKey is a function that allows to normalize the unit in the engine.
	 * @experimental
	 */
	getUnitKey?: getUnitKey

	/**
	 * flag to enable new experimental features
	 */
	flag?: FlagOptions

	/**
	 * Specify which warnings should be enabled
	 */
	warn?: boolean | WarnOptions
}
