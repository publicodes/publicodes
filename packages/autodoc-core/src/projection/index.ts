import type * as Ast from '../ast'
import { NotDefined, type ContextStackId, type TraceValue } from '../trace'
import {
	foldLabel,
	NOT_PROVIDED,
	PARAMETER_INPUT,
	PARAMETER_NOTE,
	PARAMETER_NOTES,
} from './copy'
import { displayName } from './names'
import { projectExpression, projectNode } from './nodes'
import { parameterState } from './operand'
import type {
	Ctx,
	EquationView,
	Evaluation,
	OperandView,
	ParameterState,
	RuleView,
	ValueView,
} from './types'
import { ABSENT, formatSupplied, unitOf } from './value'

export interface ProjectionOptions {
	evaluation?: Evaluation
	contextStackId?: ContextStackId
	context?: Record<string, TraceValue>
	/** The rows the reader has opened, by rule address or mechanism id. */
	expanded?: ReadonlySet<string>
	/** The fold controls the reader has touched, by mechanism id. */
	folds?: Readonly<Record<string, boolean>>
	/** The rules the host also gives a page, besides the author's own `public` ones. */
	pages?: ReadonlySet<string>
}

const NOTHING_OPEN: ReadonlySet<string> = new Set()

/**
 * The rows a click on `key` leaves open: the line itself, the chain of single lines it
 * uncovers, and nothing else — opening a line closes its siblings. A sheet that prints
 * one line gives the reader nothing to choose, so that line opens with it — and if its own
 * sheet prints one line too, so on, until a sheet prints two lines, or a line prints
 * nothing. The reader can close any of them again.
 *
 * A closed sibling keeps everything it had opened: it leaves the set only by its own key,
 * so opening it again prints its sheets as the reader had left them.
 */
export function openRow(
	ast: Ast.PublicodeAST,
	ruleName: string,
	key: string,
	options: ProjectionOptions = {},
): ReadonlySet<string> {
	const opened = new Set(options.expanded ?? NOTHING_OPEN)
	// un seul frère déplié à la fois : ouvrir une ligne referme les siennes. Leur dépliement
	// interne reste dans l'ensemble — les rouvrir les rend telles qu'elles étaient.
	const before = projectRule(ast, ruleName, {
		...options,
		expanded: opened,
	}).equation
	for (const sibling of siblingsOf(before, key) ?? []) opened.delete(sibling)
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
		:	new Set(options.expanded ?? NOTHING_OPEN)
}

/** The sheet the page prints under a row, wherever it printed that row. */
const sheetOf = (view: RuleView, key: string): EquationView | null =>
	findRow(view.equation, key)?.detail ?? null

/**
 * The lines that share an equation with `key` — its siblings. `null` when that equation
 * does not hold the line: the walk goes on, one sheet down.
 */
const siblingsOf = (
	equation: EquationView | null,
	key: string,
): readonly string[] | null => {
	if (equation === null) return null
	if (equation.rows.some((row) => row.key === key)) {
		return equation.rows
			.map((row) => row.key)
			.filter((other): other is string => other !== null && other !== key)
	}
	for (const row of equation.rows) {
		const deeper = siblingsOf(row.detail, key)
		if (deeper !== null) return deeper
	}
	return null
}

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
 *
 * What a page adds to an explanation is its answer: the line at the scale a title is read
 * at. Everything else — the fiches, the usage list, a `contexte` sheet — is an explanation.
 */
export function projectRule(
	ast: Ast.PublicodeAST,
	ruleName: string,
	options: ProjectionOptions = {},
): RuleView {
	return projectRuleAt(ast, ruleName, contextOf(ast, options), options)
}

/** A rule's computation as lines, the way a fiche or a list of consumers prints it. */
export function projectExplanation(
	ast: Ast.PublicodeAST,
	ruleName: string,
	options: ProjectionOptions = {},
): EquationView | null {
	return projectRuleAt(ast, ruleName, contextOf(ast, options), options).equation
}

const contextOf = (ast: Ast.PublicodeAST, options: ProjectionOptions): Ctx => {
	return {
		ast,
		trace: options.evaluation?.trace,
		contextStackId: options.contextStackId ?? '',
		context: options.context,
		pages: options.pages,
		expanded: options.expanded ?? NOTHING_OPEN,
		folds: options.folds ?? {},
		depth: 0,
		path: [],
		projectNode,
		projectExpression,
		projectExplanation: (address, inner) =>
			// a model that refers to itself, in a circle, stops here
			inner.path.includes(address) ?
				null
			:	projectRuleAt(ast, address, inner, options).equation,
	}
}

function projectRuleAt(
	ast: Ast.PublicodeAST,
	ruleName: string,
	ctx: Ctx,
	options: ProjectionOptions,
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
	// ce qui est entré dans un paramètre, avant ce que sa chaîne en fait : la ligne existe pour
	// tout paramètre, et dit ce que le lecteur a saisi — ou qu'il n'a rien saisi. Sans contexte,
	// la page documente le modèle : rien n'a été demandé, la ligne nomme le paramètre sans état
	const entered = ctx.context === undefined ? null : state
	const input: OperandView[] =
		state === null ?
			[]
		:	[inputRow(name, supplied, entered, rule, projected?.depth ?? 0)]
	const equation: EquationView | null =
		projected === null ? null : (
			withInput(
				{
					...projected,
					result,
				},
				input,
				ruleName,
				ctx,
			)
		)
	return {
		name,
		address: ruleName,
		description: rule.description ?? null,
		note: rule.note ?? null,
		isPublic: rule.public ?? false,
		type: rule.type,
		position: { file: rule.position.file, line: rule.position.start.line },
		// la réponse est un fait de page : c'est elle que la page imprime à l'échelle d'un titre
		answer: equation === null ? null : answer(name, result, equation),
		equation,
		values: options.evaluation?.trace ? 'computed' : 'none',
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
	id: name,
	gutter: '',
	gutterIsMechanism: false,
	key: null,
	depth: equation.depth,
	termIsMechanism: false,
	control: null,
	label: name,
	value: result,
	folded: false,
	address: null,
	page: null,
	description: null,
	parameterNote: null,
	detail: null,
	open: false,
	fold: equation.fold,
	inert: false,
	modifier: false,
	applicability: false,
})

/**
 * La ligne d'entrée, et le pli de la fiche qui la contient. Quand rien n'est entré, cette ligne
 * n'a rien fait : elle est sans effet, et c'est elle que le pli retient. Quand elle est
 * fournie, elle est un terme visible — ce qui rend au pli de quoi se refermer sur le reste.
 */
const withInput = (
	equation: EquationView,
	input: OperandView[],
	ruleName: string,
	ctx: Ctx,
): EquationView => {
	if (input.length === 0) return equation
	const rows = [...input, ...equation.rows]
	const held = rows.filter((row) => row.inert)
	const id = equation.fold?.id ?? `${ruleName}#input`
	// la fiche s'était ouverte faute d'autre chose à montrer : l'entrée fournie lui en donne
	const forcedOpen =
		equation.fold?.expanded === true && !equation.rows.some((row) => !row.inert)
	const visible = rows.some((row) => !row.inert)
	const expanded =
		ctx.folds[id] ??
		(ctx.trace === undefined ? true
		: forcedOpen && visible ? false
		: equation.fold?.expanded === true)
	return {
		...equation,
		rows: rows.map((row) => ({ ...row, folded: !expanded && row.inert })),
		size: equation.size + input.length,
		fold:
			held.length === 0 ?
				null
			:	{
					id,
					count: held.length,
					label: foldLabel(held.length, expanded),
					expanded,
				},
	}
}

/**
 * La ligne d'un paramètre : le mot du langage, et la valeur qui y est entrée. `state` est nul
 * quand la page documente le modèle : la ligne nomme le paramètre sans rien dire d'une entrée.
 */
const inputRow = (
	name: string,
	value: TraceValue | undefined,
	state: ParameterState | null,
	rule: Ast.RuleDefinition,
	depth: number,
): OperandView => ({
	id: `${name}#input`,
	gutter: PARAMETER_INPUT,
	gutterIsMechanism: true,
	key: null,
	depth,
	termIsMechanism: false,
	control: null,
	label: null,
	value:
		state === null ? ABSENT
		: value === undefined ?
			// rien n'est entré : la ligne le dit à la place du chiffre
			{ state: 'not_defined', value: NotDefined, text: NOT_PROVIDED }
		:	{
				state: 'value',
				value,
				text: formatSupplied(value, rule.value_mechanism.type, unitOf(rule)),
			},
	address: null,
	page: null,
	description: null,
	parameterNote: state === null ? PARAMETER_NOTE : PARAMETER_NOTES[state],
	detail: null,
	open: false,
	fold: null,
	// rien n'est entré : la ligne n'a rien fait, et le pli la retient
	inert: state !== null && value === undefined,
	folded: state !== null && value === undefined,
	modifier: false,
	applicability: false,
})

export { projectContextBlock } from './stack'
export { projectUsageRows } from './usage'
export type { UsageOptions, UsageTarget } from './usage'
export type { ContextBlockView } from './stack'
export { displayName, leafName } from './names'
export { projectExpression, projectNode } from './nodes'
export {
	CONTEXT_NAME,
	CONTEXT_VALUE,
	NOT_PROVIDED,
	PARAMETER_INPUT,
	PARAMETER_NOTE,
	PARAMETER_NOTES,
} from './copy'
export type {
	ContextEntryView,
	Ctx,
	EquationView,
	Evaluation,
	ValuesMode,
	FoldView,
	MechanismView,
	OperandView,
	ParameterState,
	RelatedRuleView,
	RuleView,
	ValueView,
} from './types'
