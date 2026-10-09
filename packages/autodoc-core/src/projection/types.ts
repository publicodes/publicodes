import type * as Ast from '../ast'
import type { ContextStackId, Trace, TraceValue } from '../trace'

export type FillLevel = 'evaluated' | 'generic'

export interface ValueView {
	state: 'value' | 'not_defined' | 'not_applicable' | 'absent'
	value: TraceValue | null
	text: string | null
}

export interface OperandView {
	operator: string | null
	kind: 'ref' | 'constant' | 'equation'
	/** The referenced rule's display name, when this operand is a reference. */
	name: string | null
	address: string | null
	/** What the row is: this operand written inline. */
	term: string | null
	unit: string | null
	value: ValueView
	equation: EquationView | null
	keyword: string | null
	applied: boolean | null
	/** Had no effect on the result: hidden until the reader asks for it. */
	inert: boolean
}

export interface ModifierView {
	keyword: string
	/** What the modifier applies: the argument as written, and its row. */
	condition: OperandView
	applied: boolean
	inert: boolean
}

export interface EquationView {
	keyword: string | null
	/** The whole mechanism written inline, when it can be. */
	inlineTerm: string | null
	operands: OperandView[]
	modifiers: ModifierView[]
	result: ValueView
	/** Rows that had no effect and stay folded away. */
	inertCount: number
}

export interface ContextEntryView {
	name: string
	address: string
	state: 'fournie' | 'par défaut' | 'non renseignée'
	value: ValueView
}

export type Absence = 'not_defined' | 'not_applicable' | 'no_computation'

export interface RuleView {
	name: string
	address: string
	description: string | null
	note: string | null
	isPublic: boolean
	type: string
	unit: string | null
	position: { file: string; line: number }
	equation: EquationView | null
	absence: Absence | null
	context: ContextEntryView[]
	usedBy: string[]
	fill: FillLevel
}

/**
 * What a projector needs. The two project functions are passed in rather than
 * imported, so the per-node modules never import each other in a cycle.
 */
export interface Ctx {
	ast: Ast.PublicodeAST
	trace: Trace | undefined
	contextStackId: ContextStackId
	context: Record<string, TraceValue> | undefined
	projectNode: (node: Ast.ChainedValue, ctx: Ctx) => EquationView | null
	projectExpression: (
		expression: Ast.Expression,
		ctx: Ctx,
		operator: string | null,
	) => OperandView
}
