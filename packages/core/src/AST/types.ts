import { ArrondiNode } from '../mecanisms/arrondi'
import { BarèmeNode } from '../mecanisms/barème'
import { ConditionNode } from '../mecanisms/condition'
import { ContextNode } from '../mecanisms/contexte'
import { DuréeNode } from '../mecanisms/durée'
import { EstNonDéfiniNode } from '../mecanisms/est'
import { EstNonApplicableNode } from '../mecanisms/est-non-applicable'
import { GrilleNode } from '../mecanisms/grille'
import { InversionNode } from '../mecanisms/inversion'
import { PossibilityNode } from '../mecanisms/one-possibility'
import { OperationNode } from '../mecanisms/operation'
import { RésoudreRéférenceCirculaireNode } from '../mecanisms/résoudre-référence-circulaire'
import { SimplifierUnitéNode } from '../mecanisms/simplifier-unité'
import { TauxProgressifNode } from '../mecanisms/tauxProgressif'
import { TexteNode } from '../mecanisms/texte'
import { UnitéNode } from '../mecanisms/unité'
import { VariableManquanteNode } from '../mecanisms/variablesManquantes'
import { VariationNode } from '../mecanisms/variations'
import { ReferenceNode } from '../reference'
import { ReplacementRule } from '../replacement'
import { RuleNode } from '../rule'

export type ConstantNode = {
	type: 'boolean' | 'number' | 'string' | undefined
	nodeValue: Evaluation
	nodeKind: 'constant'
	isNullable?: boolean
	isDefault?: boolean
}
type PossibleNodes =
	| RuleNode
	| ReferenceNode
	| ArrondiNode
	| BarèmeNode
	| DuréeNode
	| GrilleNode
	| EstNonApplicableNode
	| EstNonDéfiniNode
	| InversionNode
	| OperationNode
	| PossibilityNode
	| ContextNode
	| SimplifierUnitéNode
	| RésoudreRéférenceCirculaireNode
	| TauxProgressifNode
	| UnitéNode
	| VariationNode
	| ConditionNode
	| ConstantNode
	| ReplacementRule
	| VariableManquanteNode
	| TexteNode

export type NodeKind = PossibleNodes['nodeKind']
export type ASTNode<N extends NodeKind = NodeKind> = PossibleNodes & {
	nodeKind: N
	isDefault?: boolean
	sourceMap?: {
		mecanismName: string
		args: Record<string, ASTNode | Array<ASTNode>>
	}
	rawNode?: string | Record<string, unknown>
} & (
		| EvaluationDecoration<Types>
		// We remove the ESLINT warning as it does not concern intersection type and is actually useful here
		// https://github.com/typescript-eslint/typescript-eslint/issues/2063#issuecomment-675156492
		// eslint-disable-next-line @typescript-eslint/ban-types
		| {}
	)

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
export type Unit = {
	numerators: Array<BaseUnit>
	denominators: Array<BaseUnit>
}

// Idée : une évaluation est un n-uple : (value, unit, missingVariables, isApplicable)
type EvaluationDecoration<T extends Types> = {
	nodeValue: Evaluation<T>
	unit?: Unit
	traversedVariables?: Array<string>
	missingVariables: MissingVariables
}
export type Types = number | boolean | string | Record<string, unknown>

export type Evaluation<T extends Types = Types> =
	| T
	| null // Non applicable
	| undefined // Non défini

export type EvaluatedNode<
	K extends NodeKind = NodeKind,
	T extends Types = Types,
> = EvaluationDecoration<T> & ASTNode<K>

export type MissingVariables = Record<string, number>
