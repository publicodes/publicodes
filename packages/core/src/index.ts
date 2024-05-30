import { type ASTNode, type EvaluatedNode, type NodeKind } from './AST/types'
import Engine from './engine'
import parsePublicodes from './parsePublicodes'
import { type Rule, type RuleNode } from './rule'
import * as utils from './ruleUtils'

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
export default Engine

export { type ASTNode, type EvaluatedNode, type Rule, type RuleNode }

export type PublicodesExpression = string | Record<string, unknown> | number

export type Logger = {
	log(message: string): void
	warn(message: string): void
	error(message: string): void
}

export type EvaluationFunction<Kind extends NodeKind = NodeKind> = (
	this: Engine,
	node: ASTNode & { nodeKind: Kind },
) => { nodeKind: Kind } & EvaluatedNode

export type ParsedRules<Name extends string> = Record<Name, RuleNode<Name>>

export type Situation<Name extends string> = Partial<
	Record<Name, PublicodesExpression | ASTNode>
>
