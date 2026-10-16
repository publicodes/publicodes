import type * as Ast from '../ast'
import type { ContextStackId, TraceValue } from '../trace'
import { GENERIC_FILL, NO_COMPUTATION, PARAMETER_NOTES } from './copy'
import { projectContext } from './context'
import { projectUsedBy } from './graph'
import { displayName } from './names'
import { projectExpression, projectNode } from './nodes'
import { parameterState } from './operand'
import type {
	Ctx,
	EquationView,
	Evaluation,
	OperandView,
	ParameterState,
	RelatedRuleView,
	RuleView,
	ValueView,
} from './types'
import { formatSupplied, unitOf } from './value'

export interface ProjectionOptions {
	evaluation?: Evaluation
	contextStackId?: ContextStackId
	context?: Record<string, TraceValue>
	/** The rows the reader has opened, by rule address or mechanism id. */
	expanded?: ReadonlySet<string>
	/** The fold controls the reader has touched, by mechanism id. */
	folds?: Readonly<Record<string, boolean>>
}

const NOTHING_OPEN: ReadonlySet<string> = new Set()

/**
 * The rows a click on `key` leaves open: the line itself, and the chain of single lines
 * it uncovers. A sheet that prints one line gives the reader nothing to choose, so that
 * line opens with it — and if its own sheet prints one line too, so on, until a sheet
 * prints two lines, or a line prints nothing. The reader can close any of them again.
 */
export function openRow(
	ast: Ast.PublicodeAST,
	ruleName: string,
	key: string,
	options: ProjectionOptions = {},
): ReadonlySet<string> {
	const opened = new Set(options.expanded ?? NOTHING_OPEN)
	let line: string | null = key
	let chained = false
	while (line !== null && !opened.has(line)) {
		opened.add(line)
		const view = projectRule(ast, ruleName, { ...options, expanded: opened })
		const sheet = sheetOf(view, line)
		// a line the reader did not ask for is kept only where it prints lines of its own:
		// the chain reaches for the next computation, not for the sentence of an absence
		if (chained && (sheet === null || sheet.rows.length === 0)) {
			opened.delete(line)
			break
		}
		chained = true
		line = sheet !== null && sheet.rows.length === 1 ? sheet.rows[0].key : null
	}
	return opened
}

/**
 * The rows a page opens on its own: its own computation prints a single line, and there is
 * nothing to choose between one line and none, so that line comes opened — along the chain
 * of single lines under it, exactly as a click would open it. The page keeps them, so the
 * reader closes them like any other row.
 */
export function openedWithPage(
	ast: Ast.PublicodeAST,
	ruleName: string,
	options: ProjectionOptions = {},
): ReadonlySet<string> {
	const own = projectRule(ast, ruleName, options).equation?.rows ?? []
	const only = own.length === 1 ? own[0] : null
	return only?.key != null ?
			openRow(ast, ruleName, only.key, options)
		:  new Set(options.expanded ?? NOTHING_OPEN)
}

/** The sheet the page prints under a row, wherever it printed that row. */
const sheetOf = (view: RuleView, key: string): EquationView | null =>
	findRow(view.equation, key)?.detail ?? null

/** The row a key names, wherever the page printed it: under a line, or under its sheet. */
const findRow = (
	equation: EquationView | null,
	key: string,
): OperandView | null => {
	if (equation === null) return null
	for (const row of equation.rows) {
		if (row.key === key) return row
		const found = findRow(row.detail, key)
		if (found !== null) return found
	}
	return null
}

/**
 * Projects one rule into the view model its page renders — the rules the reader has
 * opened under it included, so a block renders what it is given and projects
 * nothing itself. Same rule, same options, same page.
 */
export function projectRule(
	ast: Ast.PublicodeAST,
	ruleName: string,
	options: ProjectionOptions = {},
): RuleView {
	const ctx: Ctx = {
		ast,
		trace: options.evaluation?.trace,
		contextStackId: options.contextStackId ?? '',
		context: options.context,
		expanded: options.expanded ?? NOTHING_OPEN,
		folds: options.folds ?? {},
		depth: 0,
		path: [],
		projectNode,
		projectExpression,
		projectRule: (address, inner) =>
			// a model that refers to itself, in a circle, stops here
			inner.path.includes(address) ?
				null
			:	projectRuleAt(ast, address, inner, options, false),
	}
	return projectRuleAt(ast, ruleName, ctx, options, true)
}

function projectRuleAt(
	ast: Ast.PublicodeAST,
	ruleName: string,
	ctx: Ctx,
	options: ProjectionOptions,
	/** The rule the page is about: only its computation has an answer line. */
	page: boolean,
): RuleView {
	const rule = ast[ruleName]
	const own: Ctx = { ...ctx, path: [...ctx.path, ruleName] }
	const projected = projectNode(
		{
			value_mechanism: rule.value_mechanism,
			chained_mechanisms: rule.chained_mechanisms,
		},
		own,
	)
	// A parameter's value comes from the context, not from an evaluation: the
	// runtime returns it without recording a trace entry for the rule itself.
	const supplied = ctx.context?.[ruleName]
	const result =
		projected?.result.state === 'absent' && supplied !== undefined ?
			{
				state: 'value' as const,
				value: supplied,
				text: formatSupplied(supplied, rule.value_mechanism.type, unitOf(rule)),
			}
		:	(projected?.result ?? ABSENT_RESULT)
	const state = parameterState(ruleName, ctx)
	const name = displayName(ast, ruleName)
	const equation: EquationView | null =
		projected === null ? null : (
			{
				...projected,
				result,
				head: page ? answer(name, result, projected) : null,
				// a mechanism that holds nothing at all is a rule with no computation: the
				// sentence says where its value comes from rather than what is missing here
				note: projected.size > 0 ? projected.note : noteFor(state),
			}
		)
	return {
		name,
		address: ruleName,
		description: rule.description ?? null,
		note: rule.note ?? null,
		isPublic: rule.public ?? false,
		type: rule.type,
		position: { file: rule.position.file, line: rule.position.start.line },
		siblings: siblings(ast, ruleName),
		equation,
		context: projectContext(
			rule,
			own,
			options.evaluation?.evaluatedRule === undefined ||
				options.evaluation?.evaluatedRule === ruleName ?
				options.evaluation?.usedParameters
			:	undefined,
			options.evaluation?.evaluatedRule === undefined ||
				options.evaluation?.evaluatedRule === ruleName ?
				options.evaluation?.missing
			:	undefined,
		),
		usedBy: projectUsedBy(rule).map((address) => ({
			address,
			name: displayName(ast, address),
		})),
		fill: options.evaluation?.trace ? 'evaluated' : 'generic',
		fillNote: options.evaluation?.trace ? null : GENERIC_FILL,
	}
}

const ABSENT_RESULT: ValueView = { state: 'absent', value: null, text: null }

/**
 * The rule's own answer line: its name, its value, and the fold control of the
 * computation under it. It is a row like any other, so the page has one way of
 * printing a line.
 */
const answer = (
	name: string,
	result: ValueView,
	equation: EquationView,
): OperandView => ({
	gutter: '',
	gutterIsMechanism: false,
	key: null,
	depth: equation.depth,
	term: null,
	termIsMechanism: false,
	control: null,
	label: name,
	value: result,
	paper: equation.paper,
	address: null,
	page: null,
	description: null,
	parameter: null,
	parameterNote: null,
	detail: null,
	open: false,
	fold: equation.fold,
	inert: false,
	modifier: false,
})

/** What a fiche says when it has no line to show, in place of showing none. */
const noteFor = (state: ParameterState | null): string =>
	state !== null ? PARAMETER_NOTES[state] : NO_COMPUTATION

/** The rules that share its namespace: the index a page can offer. */
const siblings = (
	ast: Ast.PublicodeAST,
	ruleName: string,
): RelatedRuleView[] => {
	const parent = ruleName.split(' . ').slice(0, -1).join(' . ')
	return Object.keys(ast)
		.filter((name) => name.split(' . ').slice(0, -1).join(' . ') === parent)
		.map((address) => ({ address, name: displayName(ast, address) }))
}

export { displayName, leafName } from './names'
export { projectExpression, projectNode } from './nodes'
export { GENERIC_FILL, NO_COMPUTATION, PARAMETER_NOTES } from './copy'
export type {
	ContextEntryView,
	Ctx,
	EquationView,
	Evaluation,
	FillLevel,
	FoldView,
	MechanismView,
	OperandView,
	ParameterState,
	RelatedRuleView,
	RuleView,
	ValueView,
} from './types'
