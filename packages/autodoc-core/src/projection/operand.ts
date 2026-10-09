import type * as Ast from '../ast'
import type { Ctx, OperandView } from './types'
import { ABSENT, textOf, unitOf } from './value'

/**
 * The operand a child node contributes to the equation it sits in. A bare
 * reference keeps its name and its address, so the view links it rather than
 * unfolding an equation that holds a single row.
 */
export function projectOperand(
	child: Ast.ChainedValue,
	ctx: Ctx,
	operator: string | null,
	keyword: string | null,
): OperandView {
	const equation = ctx.projectNode(child, ctx)
	const value = equation?.result ?? ABSENT
	const single =
		equation?.keyword === 'expression' && equation.operands.length === 1 ?
			equation.operands[0]
		:	null
	// an expression is a row like any other now: its equation is what the row
	// opens, so nothing is spliced away here
	const nested =
		!single && equation &&
		equation.operands.length + equation.modifiers.length > 0 ?
			equation
		:	null
	return {
		operator,
		kind: single ? 'ref' : equation ? 'equation' : 'constant',
		name: single?.name ?? null,
		address: single?.address ?? null,
		term: single?.name ?? equation?.inlineTerm ?? textOf(value),
		unit: unitOf(child.value_mechanism) ?? null,
		value,
		equation: nested,
		keyword,
		applied: null,
		inert: false,
	}
}
