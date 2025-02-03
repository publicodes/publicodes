import { ArrondiNode } from '../mecanisms/arrondi'
import { BarèmeNode } from '../mecanisms/bareme'
import { ConditionNode } from '../mecanisms/condition'
import { ContextNode } from '../mecanisms/contexte'
import { DuréeNode } from '../mecanisms/duree'
import { EstNonDéfiniNode } from '../mecanisms/est'
import { EstNonApplicableNode } from '../mecanisms/est-non-applicable'
import { GrilleNode } from '../mecanisms/grille'
import { InversionNode } from '../mecanisms/inversion'
import { LogarithmeNode } from '../mecanisms/logarithme'
import { OperationNode } from '../mecanisms/operation'
import { RésoudreRéférenceCirculaireNode } from '../mecanisms/resoudre-reference-circulaire'
import { SimplifierUnitéNode } from '../mecanisms/simplifier-unite'
import { TauxProgressifNode } from '../mecanisms/tauxProgressif'
import { TexteNode } from '../mecanisms/texte'
import { UnitéNode } from '../mecanisms/unite'
import { VariableManquanteNode } from '../mecanisms/variablesManquantes'
import { VariationNode } from '../mecanisms/variations'
import { UnePossibilitéNode } from '../mecanisms/unePossibilité'
import { ReferenceNode } from '../parseReference'
import { ReplacementRule } from '../parseReplacement'
import { Rule, RuleNode } from '../rule'

export type ConstantNode = {
	nodeKind: 'constant'
	isNullable?: boolean
	isDefault?: boolean
	fullPrecision?: boolean
	nodeValue: Evaluation
} & (
	| { type: 'number'; unit?: Unit }
	| { type: 'boolean' | 'string' | 'date' | undefined }
)

type PossibleNodes =
	| ArrondiNode
	| BarèmeNode
	| ConditionNode
	| ConstantNode
	| ContextNode
	| DuréeNode
	| EstNonApplicableNode
	| EstNonDéfiniNode
	| GrilleNode
	| InversionNode
	| OperationNode
	| ReferenceNode
	| ReplacementRule
	| RésoudreRéférenceCirculaireNode
	| RuleNode
	| SimplifierUnitéNode
	| TauxProgressifNode
	| TexteNode
	| UnePossibilitéNode
	| UnitéNode
	| VariableManquanteNode
	| VariationNode
	| LogarithmeNode

/**@hidden */
export type NodeKind = PossibleNodes['nodeKind']

/**
 * Represents a node in the Abstract Syntax Tree of a publicodes expression.
 *
 * It can be browsed and transformed using the {@link transformAST}, {@link reduceAST} and {@link traverseASTNode} methods.
 *
 *
 * @warning
 * The ASTNode types are considered internal implementation details.
 * They are not covered by semantic versioning guarantees and may undergo breaking changes
 * without a major version bump. Use them at your own risk.
 *
 * @typeParam N - The kind of node this ASTNode represents (a string literal type).
 *
 * @example
 * ```ts
 * let node: ASTNode<'rule'>
 * ```
 */
export type ASTNode<N extends NodeKind = NodeKind> = PossibleNodes & {
	nodeKind: N
	isDefault?: boolean
	sourceMap?: {
		mecanismName: string
		args: Record<string, ASTNode | Array<ASTNode>>
	}
	rawNode?: string | Rule
}
// TODO : separate type for evaluated AST Tree

export type MecanismNode = ASTNode<
	Exclude<NodeKind, 'rule' | 'reference' | 'constant'>
>

export type ASTTransformer = (n: ASTNode) => ASTNode
export type ASTVisitor = (n: ASTNode) => void

export type TraverseFunction<K extends NodeKind> = (
	fn: ASTTransformer,
	node: ASTNode<K>,
) => ASTNode<K>

export type BaseUnit = string
// TODO: I believe it would be more effecient (for unit conversion and for
// inference), and more general to represent units using a map of base unit to
// their power number :
//
// type Unit = Map<BaseUnit, number>
// N.m²/kg² <-> {N: 1, m: 2, kg: -2} (gravity constant)
/**
 * Represents the unit of a number.
 *
 * @example 'm/s²'
 * ```ts
 * {
 * 	numerators: ['m'],
 * 	denominators: ['s', 's']
 * }
 * ```
 *
 * @see {@link serializeUnit}
 * @see {@link parseUnit}
 */
export type Unit = {
	numerators: Array<string>
	denominators: Array<string>
}

export type EvaluatedValueTypes = number | boolean | string

export type Evaluation<T extends EvaluatedValueTypes = EvaluatedValueTypes> =
	| T
	| null // Non applicable
	| undefined // Non défini

/**
 * An {@link ASTNode} decorated with evaluation information
 *
 * Returned by {@link Engine.evaluate}.
 *
 */

export type EvaluatedNode<
	K extends NodeKind = NodeKind,
	T extends EvaluatedValueTypes = EvaluatedValueTypes,
> = {
	/**
	 * The value of the node after evaluation.
	 *
	 * Can be a number, a string, a boolean, null (« non applicable ») or undefined (« non défini »).
	 */
	nodeValue: Evaluation<T>
	/**
	 * The unit in which the value is expressed.
	 */
	unit?: Unit
	/**
	 * @experimental
	 * The list of all the rules that have been traversed to evaluate this node.
	 */
	traversedVariables?: Array<string>
	/**
	 * The rules that are needed in the situation to compute the exact value for this node.
	 */
	missingVariables: MissingVariables
} & ASTNode<K>

export type MissingVariables = Record<string, number>
