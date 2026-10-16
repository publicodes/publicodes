import type * as Ast from '../ast'
import type { TraceValue } from '../trace'
import type {
	ContextEntryView,
	Ctx,
	EquationView,
	MechanismView,
	OperandView,
	ValueView,
} from './types'
import { finishEquation, finishRow, projectOperand } from './operand'
import { ABSENT, lookupValue, unitOf } from './value'
import { displayName } from './names'

/** A sheet prints lines or a context table; this is the mechanism behind neither. */
const NO_MECHANISM: MechanismView = {
	keyword: null,
	inlineTerm: null,
	operands: [],
	modifiers: [],
	result: ABSENT,
}

const KEYWORDS = {
	default: 'par défaut',
	ceiling: 'plafond',
	floor: 'plancher',
	round_up: 'arrondi au supérieur',
	round_down: 'arrondi à l’inférieur',
	round_nearest: 'arrondi',
	applicable_if: 'applicable si',
	not_applicable_if: 'non applicable si',
	context: 'contexte',
} as const

type ModifierKind = keyof typeof KEYWORDS

/**
 * The order the compiler applies the chainable mechanisms in, outermost first.
 * `shared_ast.ml` declares the variants in this order and sorts by it before folding
 * (`unfold_chainable_mechanism`), so the node that carries a rule's value is the first
 * mechanism here the engine recorded. The AST lists them as the author wrote them,
 * which says nothing about the nesting.
 */
const OUTERMOST_FIRST: readonly Ast.ChainedMechanism['kind'][] = [
	'context',
	'applicable_if',
	'not_applicable_if',
	'type_def',
	'default',
	'ceiling',
	'floor',
	'round_up',
	'round_down',
	'round_nearest',
]

/**
 * What the evaluation of a chain says it is worth: the value of the outermost of its
 * mechanisms, or nothing when the engine recorded none of them.
 */
export function valueOfChain(
	node: Ast.ChainedValue,
	/** Where the engine wrote the chain's own value. */
	ctx: Ctx,
	/** Where it wrote what a `contexte` binds: one stack up, at the caller's side. */
	outside: Ctx,
): ValueView | null {
	const mechanisms = [...node.chained_mechanisms].sort(
		(a, b) => OUTERMOST_FIRST.indexOf(a.kind) - OUTERMOST_FIRST.indexOf(b.kind),
	)
	for (const mechanism of mechanisms) {
		const where = mechanism.kind === 'context' ? outside : ctx
		const value = lookupValue(
			where,
			mechanism.id,
			mechanism.type,
			unitOf(mechanism),
		)
		if (value.state !== 'absent') return value
	}
	return null
}

/**
 * What a `contexte` mechanism binds, as the evaluation context a reader knows: each
 * rule it gives a value to, with that value. The bindings are written at the caller's
 * side of the stack the mechanism pushes.
 */
export function boundContext(
	mechanism: Ast.ContextMechanism,
	ctx: Ctx,
): ContextEntryView[] {
	return Object.entries(mechanism.parameters).map(([address, bound]) => {
		const target = ctx.ast[address]?.value_mechanism ?? bound.value_mechanism
		return {
			name: displayName(ctx.ast, address),
			address,
			state: 'fournie' as const,
			qualifier: null,
			value: lookupValue(
				ctx,
				bound.value_mechanism.id,
				target.type,
				unitOf(target),
			),
		}
	})
}

/**
 * The row a `contexte` mechanism gets, like any other chained mechanism: its own word
 * in the gutter, and the values it binds underneath — as the page prints a context.
 * The reader is not offered to hide it: what a rule is evaluated against is not an
 * explanation to fold away, so the line carries no control and the sheet is always
 * printed.
 */
export function contextModifier(
	node: Ast.ChainedValue,
	under: Ctx,
	caller: Ctx,
): OperandView | null {
	const mechanism = contextOf(node)
	if (mechanism === undefined) return null
	const entries = boundContext(mechanism, caller)
	const sheet: EquationView = {
		...finishEquation(
			NO_MECHANISM,
			{ ...under, depth: under.depth + 1 },
			mechanism.id,
		),
		// the table is what the sheet prints; there is no missing line to apologise for
		note: null,
		context: entries,
	}
	const row = finishRow(
		{
			id: mechanism.id,
			name: null,
			address: null,
			description: null,
			parameter: null,
			term: null,
			named: null,
			value: ABSENT,
			detail: sheet,
		},
		under,
		null,
		KEYWORDS.context,
	)
	return { ...row, key: null, control: null, detail: sheet, open: true }
}

/**
 * Modifiers change a value rather than compose one, so they hang under the value
 * they change, keyword first, marked taken effect or not.
 */
export function projectModifiers(
	node: Ast.ChainedValue,
	ctx: Ctx,
	result: ValueView,
): OperandView[] {
	const modifiers: OperandView[] = []
	for (const mechanism of node.chained_mechanisms) {
		switch (mechanism.kind) {
			case 'default':
			case 'ceiling':
			case 'floor':
			case 'round_up':
			case 'round_down':
			case 'round_nearest':
			case 'applicable_if':
			case 'not_applicable_if': {
				// What the modifier applies is written — a condition, a ceiling, an
				// arrondi — so its row shows the author's text, the trace's value
				// when there is one, and opens onto the argument's computation.
				const argument = projectOperand(
					mechanism.parameters,
					ctx,
					null,
					KEYWORDS[mechanism.kind],
				)
				const applied = decided(mechanism.kind, argument.value, result)
				modifiers.push({ ...argument, inert: !applied, modifier: true })
				break
			}
			case 'context':
			case 'type_def':
				break
			default:
				mechanism satisfies never
		}
	}
	return modifiers
}

/**
 * Whether the modifier decided the value it hangs under. `applicable si` decides
 * the answer either way; `non applicable si` only when its condition is not
 * false; `par défaut` and the caps are the ones in force when the result is
 * theirs; an arrondi is part of the computation, not a term that may do nothing.
 */
function decided(
	kind: ModifierKind,
	argument: ValueView,
	result: ValueView,
): boolean {
	switch (kind) {
		case 'applicable_if':
		case 'round_up':
		case 'round_down':
		case 'round_nearest':
		case 'context':
			return true
		case 'not_applicable_if':
			return argument.value !== false
		default:
			return (
				argument.state === 'value' &&
				result.state === 'value' &&
				argument.text === result.text
			)
	}
}

/**
 * The `contexte` mechanism of a node, when it has one.
 */
export function contextOf(
	node: Ast.ChainedValue,
): Ast.ContextMechanism | undefined {
	return node.chained_mechanisms.find(
		(mechanism) => mechanism.kind === 'context',
	)
}

/**
 * The context the engine evaluates a chain's value under. A `contexte` mechanism
 * pushes a stack of its own — the caller's, then the mechanism's own id, exactly as
 * the compiler writes it — so everything under the mechanism is traced there. The
 * values it binds are the exception: they are written on the caller's side.
 */
export function contextInside(node: Ast.ChainedValue, ctx: Ctx): Ctx {
	const context = contextOf(node)
	if (context === undefined) return ctx
	const bound: Record<string, TraceValue> = { ...ctx.context }
	for (const [address, value] of Object.entries(context.parameters)) {
		const given = lookupValue(
			ctx,
			value.value_mechanism.id,
			value.value_mechanism.type,
			unitOf(value.value_mechanism),
		)
		if (given.value !== null) bound[address] = given.value
	}
	return {
		...ctx,
		context: bound,
		contextStackId: `${ctx.contextStackId}-${context.id}`,
	}
}
