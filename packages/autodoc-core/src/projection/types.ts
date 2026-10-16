import type * as Ast from '../ast'
import type { ContextStackId, Trace, TraceValue } from '../trace'

export type FillLevel = 'evaluated' | 'generic'

export interface ValueView {
	state: 'value' | 'not_defined' | 'not_applicable' | 'absent'
	value: TraceValue | null
	text: string | null
}

/**
 * What a leaf projector returns: a row's own facts, before the view adds where its
 * control sits, which paper it is on, and what opens under it.
 */
export interface RawOperand {
	/** The mechanism this row opens, when it can open one. */
	id: string | null
	name: string | null
	address: string | null
	description: string | null
	parameter: ParameterState | null
	/** The row written inline, or its name. */
	term: string | null
	/** The mechanism's own word, when the row has no written form of its own. */
	named: string | null
	value: ValueView
	/**
	 * What it opens onto, when that is a mechanism's own lines. Projected one level in,
	 * like the fiche of a reference, so a row never decides the paper of its fiche.
	 */
	detail: EquationView | null
}

/**
 * What a per-node projector returns: the mechanism's own facts. The view adds what
 * its readers need — the lines to print, the fold, the paper — in one place, so no
 * mechanism decides that for itself.
 */
export interface MechanismView {
	keyword: string | null
	inlineTerm: string | null
	operands: OperandView[]
	modifiers: OperandView[]
	result: ValueView
	/**
	 * The terms it holds back are printed with it, unless the reader folds them back: what
	 * the mechanism prints alone would not say why it applies. A conditional that kept its
	 * `sinon` is the one case — its conditions are then the whole of its explanation.
	 */
	expandedByDefault?: boolean
}

/**
 * What a fiche holds back, and how to ask for it. Keyed by the mechanism whose
 * terms are held back, which is stable across projections, so the host can keep
 * the reader's choices in a plain map.
 */
export interface FoldView {
	id: string
	count: number
	/** Both the visible label and the accessible name. */
	label: string
	expanded: boolean
}

/**
 * One line of a computation, with every printing decision already made: what the
 * gutter says, what the row is called, where its control sits, whether it is open,
 * and what opens under it. A view renders this; it derives nothing.
 */
export interface OperandView {
	/** The keyword or the operator, in the operator column. Empty when neither. */
	gutter: string
	/**
	 * That mark is a word of the language, not an operator: it takes the label's own
	 * size, where a sign takes the size of the notation it belongs to.
	 */
	gutterIsMechanism: boolean
	/** What opens or closes this row, when a click does anything. */
	key: string | null
	/** Its distance from the page's computation: the copy's indentation. */
	depth: number
	/** The middle column: a name, a written form, or a mechanism's own word. */
	term: string | null
	/** The term is a mechanism's word, and is set as such. */
	termIsMechanism: boolean
	/** Where the row's control sits: on its term, on its value, or nowhere. */
	control: 'term' | 'value' | null
	/** What that control says. */
	label: string | null
	value: ValueView
	/** The sheet this line is written on: the papers alternate with depth. */
	paper: 'white' | 'shade'
	/** The rule this row stands for, when it stands for one. */
	address: string | null
	/** The rule to lead to, when the one this row stands for has a page. */
	page: RelatedRuleView | null
	/** What that rule says it is, for a reader who asks. */
	description: string | null
	/** Set when the model does not compute this value here: how it got it. */
	parameter: ParameterState | null
	/** The sentence that explains that state, wherever it is shown. */
	parameterNote: string | null
	/** What opens under this line: a fiche, or a sentence saying there is none. */
	detail: EquationView | null
	/** The row is unfolded now, and its detail is being printed. */
	open: boolean
	/** The terms this row's own line holds back: those of the fiche it opens. */
	fold: FoldView | null
	/** Had no effect on the result: shown only when the reader asks for it. */
	inert: boolean
	/** An annotation the chain adds to the value above, rather than a term of the expression. */
	modifier: boolean
}

export interface EquationView {
	/** The mechanism's own word, where it has one. */
	keyword: string | null
	/** The whole mechanism written inline, when it can be. */
	inlineTerm: string | null
	/** The rule's own answer line, when this is the rule's computation. */
	head: OperandView | null
	/** The lines to print, in order: what the reader sees, nothing more. */
	rows: OperandView[]
	/** How many lines the mechanism has, before any are held back. */
	size: number
	/** What the mechanism returned. */
	result: ValueView
	/** The terms held back from those lines, when there are any. */
	fold: FoldView | null
	/** A sentence in place of rows, for a computation that has none to show. */
	note: string | null
	/**
	 * The `contexte` mechanism these lines are read under, when one governs them: a
	 * navigation from inside them keeps the stack that mechanism pushed.
	 */
	contextId: string | null
	/** Its distance from the page's own computation, which sets the paper. */
	depth: number
	/** The sheet the lines are written on: the papers alternate with depth. */
	paper: 'white' | 'shade'
	/**
	 * The words that head a table sheet, when the sheet is a list of named values rather than
	 * a computation — what it is, what a line names, and what it is worth. A `contexte` opens
	 * the only such sheet there is.
	 */
	header: readonly [string, string, string] | null
}

/**
 * How a value the model does not compute arrived: given by the caller, written
 * by the author as a default, or not given at all.
 */
export type ParameterState = 'fournie' | 'par défaut' | 'non renseignée'

/**
 * What evaluating a rule left behind. `usedParameters` and `missing` describe
 * that evaluation, so they only speak for `evaluatedRule`: another rule's page
 * falls back to its own declared parameters. The compiler's evaluation does not
 * carry the rule it was produced for yet, so the caller states it.
 */
export interface Evaluation {
	trace: Trace
	usedParameters?: readonly string[]
	missing?: readonly string[]
	evaluatedRule?: string
}

export interface ContextEntryView {
	name: string
	address: string
	state: ParameterState
	/** The word that qualifies the state, where one is needed. */
	qualifier: string | null
	value: ValueView
}

export interface RuleView {
	name: string
	address: string
	description: string | null
	/** The author's note, which no block renders. */
	note: string | null
	isPublic: boolean
	type: string
	position: { file: string; line: number }
	/** The rules that share its namespace: the index a page can offer. */
	siblings: RelatedRuleView[]
	equation: EquationView | null
	context: ContextEntryView[]
	/** The rules that consume this one, by the model's own names. */
	usedBy: RelatedRuleView[]
	fill: FillLevel
	/** What to say about a page projected without an evaluation. */
	fillNote: string | null
}

/** A rule the reader can reach from this one, by the model's own namespaces. */
export interface RelatedRuleView {
	address: string
	name: string
}

/**
 * What a projector needs. The project functions are passed in rather than
 * imported, so the per-node modules never import each other in a cycle.
 */
export interface Ctx {
	ast: Ast.PublicodeAST
	trace: Trace | undefined
	contextStackId: ContextStackId
	context: Record<string, TraceValue> | undefined
	/** The rows the reader has opened, by rule address. */
	expanded: ReadonlySet<string>
	/** The fold controls the reader has touched, by mechanism id. */
	folds: Readonly<Record<string, boolean>>
	/** How deep this equation sits, which sets its paper. */
	depth: number
	/** The rules above it, so an expansion that loops back stops. */
	path: readonly string[]
	projectNode: (node: Ast.ChainedValue, ctx: Ctx) => EquationView | null
	projectExpression: (expression: Ast.Expression, ctx: Ctx) => RawOperand
	/** A referenced rule's own computation, for the fiche a row opens. */
	projectRule: (address: string, ctx: Ctx) => RuleView | null
}
