import type * as Ast from '../ast'
import type {
	Ctx,
	EquationView,
	MechanismView,
	OperandView,
	ParameterState,
	RawOperand,
} from './types'
import { PARAMETER_NOTES, foldLabel } from './copy'
import { mechanismName } from './mechanism-name'
import { ABSENT } from './value'

/**
 * How a rule's value arrived, when the model does not compute it: given by the
 * caller, written as a default, or missing. `null` when the rule computes.
 */
export function parameterState(
	address: string,
	ctx: Ctx,
): ParameterState | null {
	const rule = ctx.ast[address]
	if (rule === undefined || rule.value_mechanism.kind !== 'not_defined') {
		return null
	}
	if (ctx.context?.[address] !== undefined) return 'fournie'
	if (rule.chained_mechanisms.some((mechanism) => mechanism.kind === 'default')) {
		return 'par défaut'
	}
	return 'non renseignée'
}

/**
 * Finishes an equation: which lines are printed, what the fold holds back, and
 * which paper the lines are written on. Every mechanism goes through here, so no
 * mechanism decides any of it for itself.
 */
export function finishEquation(
	mechanism: MechanismView,
	ctx: Ctx,
	id: string,
): EquationView {
	const rows = [...mechanism.operands, ...mechanism.modifiers]
	const held = rows.filter((row) => row.inert)
	// the reader's choice first; failing one, terms that had no effect are held back
	// unless holding them back would leave the fiche with nothing else to show
	const expanded =
		ctx.folds[id] ??
		(ctx.trace === undefined || (held.length > 0 && held.length === rows.length))
	const fold =
		held.length > 0 ?
			{ id, count: held.length, label: foldLabel(held.length, expanded), expanded }
		:	null
	return {
		keyword: mechanism.keyword,
		inlineTerm: mechanism.inlineTerm,
		head: null,
		rows: expanded ? rows : rows.filter((row) => !row.inert),
		size: rows.length,
		result: mechanism.result,
		fold,
		note: null,
		depth: ctx.depth,
		paper: ctx.depth % 2 === 0 ? 'white' : 'shade',
	}
}

/**
 * A row hands over what it opens in the shape the finisher takes. The round trip is
 * what keeps one place — the finisher — deciding which lines are printed.
 */
export function asMechanism(equation: EquationView): MechanismView {
	return {
		keyword: equation.keyword,
		inlineTerm: equation.inlineTerm,
		operands: equation.rows,
		modifiers: [],
		result: equation.result,
	}
}

/**
 * Finishes a row: what its gutter says, where its control sits, which paper it is
 * written on, and what opens under it. One place for every row of the page, whether
 * it comes from a written expression or from a mechanism's operand.
 */
export function finishRow(
	raw: RawOperand,
	ctx: Ctx,
	operator: string | null,
	keyword: string | null,
): OperandView {
	// a term that only repeats the value is not printed twice; a mechanism with no
	// written form goes by its name instead of leaving the middle column empty
	const term =
		raw.term !== null && raw.term !== raw.value.text ? raw.term : raw.named
	const key = raw.address ?? raw.id
	// what a fiche holds is one gutter further in, so it is projected that way
	const inner = { ...ctx, depth: ctx.depth + 1 }
	const rule = raw.address !== null ? ctx.projectRule(raw.address, inner) : null
	const folder =
		rule?.equation ??
		(raw.equation !== null && raw.id !== null ?
			finishEquation(raw.equation, ctx, raw.id)
		:	null)
	const detail = key !== null && ctx.expanded.has(key) ? folder : null
	const label = raw.name ?? term
	const opens = raw.address !== null || folder !== null
	return {
		gutter: keyword ?? operator ?? '',
		gutterIsMechanism: keyword !== null,
		key: key !== null && (raw.address !== null || opens) ? key : null,
		depth: ctx.depth,
		term,
		termIsMechanism: term !== null && term === raw.named,
		control: !opens ? null : label !== null ? 'term' : 'value',
		label,
		value: raw.value,
		paper: ctx.depth % 2 === 0 ? 'white' : 'shade',
		address: raw.address,
		// the way to the rule's own page, when it has one and the reader has it open
		page:
			detail !== null && rule?.isPublic === true && raw.address !== null ?
				{ address: raw.address, name: rule.name }
			:	null,
		description: raw.description,
		parameter: raw.parameter,
		parameterNote:
			raw.parameter !== null ? PARAMETER_NOTES[raw.parameter] : null,
		detail,
		open: detail !== null,
		fold: detail?.fold ?? null,
		inert: false,
	}
}

/**
 * The operand a mechanism's child contributes to its equation. The child's own
 * equation says what it is worth and what it opens onto; this decides how its line
 * reads.
 */
export function projectOperand(
	child: Ast.ChainedValue,
	ctx: Ctx,
	operator: string | null,
	keyword: string | null,
): OperandView {
	const equation = ctx.projectNode(child, ctx)
	const value = equation?.result ?? ABSENT
	// a bare reference keeps its name and its address, so the row leads to it rather
	// than unfolding an equation that holds a single line
	const single =
		equation?.keyword === 'expression' && equation.rows.length === 1 ?
			equation.rows[0]
		:	null
	const named = mechanismName(child.value_mechanism)
	return finishRow(
		{
			id: single === null ? child.value_mechanism.id : null,
			name: single?.label ?? null,
			address: single?.address ?? null,
			description: single?.description ?? null,
			parameter: single?.parameter ?? null,
			term: single?.term ?? equation?.inlineTerm ?? null,
			named,
			value,
			equation: equation === null ? null : asMechanism(equation),
		},
		ctx,
		operator,
		keyword,
	)
}
