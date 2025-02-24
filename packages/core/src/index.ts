import { type ASTNode, type EvaluatedNode, type NodeKind } from './AST/types'
import { Engine, type EngineOptions, type StrictOptions } from './engine'
import parsePublicodes, { RawRule } from './parsePublicodes'
import { type Rule, type RuleNode } from './parseRule'

import * as utils from './ruleUtils'

export {
	reduceAST,
	makeASTTransformer as transformAST,
	traverseASTNode,
} from './AST/index'
export { type Evaluation, type Unit } from './AST/types'
export { isPublicodesError, PublicodesError } from './error'
export { capitalise0, formatValue } from './format'
export { simplifyNodeUnit } from './nodeUnits'
export {
	parseExpression,
	type ExprAST,
	type BinaryOp,
	type UnaryOp,
} from './parseExpression'
export { default as serializeEvaluation } from './serializeEvaluation'
export { parseUnit, serializeUnit } from './units'
export { parsePublicodes }

/**
 * Contains utilities to manipulate publicodes rules by name.
 *
 * @namespace
 * @experimental
 */
export { utils }

export default Engine

export {
	type ASTNode,
	type EngineOptions,
	type EvaluatedNode,
	type NodeKind,
	type Rule,
	type RuleNode,
	type StrictOptions,
}

export type { Possibility } from './parsePossibilité'
/**
 * A publicodes expression that can be evaluated by the {@link Engine}.
 *
 * It can be parsed to an ASTNode with the {@link parseExpression} function or evaluated directly by the engine with the {@link Engine.evaluate} method.
 *
 * @example
 * ```js
 * const expression1 = 'prix du panier' // Rule name
 * const expression2 = 'prix du panier + 20' // Operation
 * const expression3 = { valeur: "salaire brut", unité: "€/an", "arrondi": "oui" } // Mecanism
 * ```
 */
export type PublicodesExpression = string | Record<string, unknown> | number

/**
 * A logger object that can be passed to the engine to log messages.
 *
 * Useful for debugging or customizing the engine's output.
 *  @example only display errors and ignore warnings:
 * ```javascript
 * const logger = {
 * 	log: () => {},
 * 	warn: () => {},
 * 	error: console.error,
 * }
 * const engine = new Engine(rules, { logger })
 * ```
 */
export type Logger = {
	log(message: string): void
	warn(message: string): void
	error(message: string): void
}

/**@internal */
export type EvaluationFunction<Kind extends NodeKind = NodeKind> = (
	this: Engine,
	node: ASTNode & { nodeKind: Kind },
) => { nodeKind: Kind } & EvaluatedNode

/**
 * A set of rules that have been parsed from a {@link RawPublicodes} object.
 *
 * @remarks The {@link Engine.evaluate} method is responsable for parsing the rules and cache them in the engine, but you can also parse them manually with the ${@link parsePublicodes} function.
 */
export type ParsedRules<RuleNames extends string = string> = Record<
	RuleNames,
	RuleNode<RuleNames>
>

/**
 * Rules as they are output from the compilation step : a javascript object transformed from the yaml files
 *
 * They are parsed during the initialization of the engine (see {@link Engine.constructor})
 */
export type RawPublicodes<RuleNames extends string> = Partial<
	Record<RuleNames, RawRule>
>

/**
 * A situation object that can be passed to the engine
 *
 * Can be used to set the values of any existing rules with the {@link Engine.setSituation} method.
 *
 * Note: When strict option on `situation` (see {@link StrictOptions}) is set to the Engine, the situation passed to the engine can be filtered (but retrieved with {@link Engine.getSituation}).
 *
 * @example
 * ```js
 * const situation = {
 * 	"salaire brut": 30000 # can be a number
 *  "contrat . heures travaillées": {
 * 	  "valeur": 35,
 * 	  "unité": "h/semaine"
 *   }
 *
 */
export type Situation<RuleNames extends string> = Partial<
	Record<RuleNames, PublicodesExpression | ASTNode>
>
