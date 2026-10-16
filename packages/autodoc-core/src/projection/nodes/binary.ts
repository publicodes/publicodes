import type * as Ast from '../../ast'
import { flattens, inverts } from '../../binary-expression'
import type { Ctx, MechanismView, OperandView, RawOperand } from '../types'
import { expressionText } from '../expression-text'
import { finishEquation, finishRow } from '../operand'
import { lookupValue, unitOf } from '../value'

const OPERATORS: Record<Ast.BinaryOperationExpression['kind'], string> = {
	add: '+',
	sub: '−',
	mul: '×',
	div: '÷',
	pow: '^',
	gt: '>',
	lt: '<',
	gteq: '≥',
	lteq: '≤',
	eq: '=',
	noteq: '≠',
	and: 'et',
	or: 'ou',
	max: 'max',
	min: 'min',
}

/** An expression the operators above write: the kinds an operation is made of. */
export const isBinaryOperation = (
	expression: Ast.Expression,
): expression is Ast.BinaryOperationExpression =>
	Object.prototype.hasOwnProperty.call(OPERATORS, expression.kind)

/**
 * The operator a line wears, turned around when a subtraction or a division opened the
 * parenthesis above it: `a − (b + c)` is an `a − b − c`.
 */
const INVERSE: Record<string, string> = {
	'+': '−',
	'−': '+',
	'×': '÷',
	'÷': '×',
}

const signOf = (operator: string, turned: boolean): string =>
	turned ? (INVERSE[operator] ?? operator) : operator

/**
 * An operation as a mechanism: its two operands around their operator. Kept apart from
 * the row, because an expression wrapping an operation takes it as its own.
 */
export function binaryMechanism(
	expression: Ast.BinaryOperationExpression,
	ctx: Ctx,
): MechanismView {
	// a chain of the same precedence is one equation: `a + b + c` is three lines, not a
	// sum inside a sum. Where the nesting is the meaning — `a − (b − c)`, a power — it
	// keeps its own line.
	const rows: OperandView[] = []
	let node = expression
	let before: string | null = null
	let turned = false
	for (;;) {
		rows.push(
			finishRow(
				ctx.projectExpression(node.parameters.left, ctx),
				ctx,
				before,
				null,
			),
		)
		const operator = signOf(OPERATORS[node.kind], turned)
		const right = node.parameters.right
		if (isBinaryOperation(right) && flattens(node.kind, right.kind)) {
			before = operator
			turned = turned !== inverts(node.kind)
			node = right
			continue
		}
		rows.push(finishRow(ctx.projectExpression(right, ctx), ctx, operator, null))
		break
	}
	return {
		keyword: 'expression',
		inlineTerm: expressionText(ctx.ast, expression),
		operands: rows,
		modifiers: [],
		result: lookupValue(ctx, expression.id, expression.type, unitOf(expression)),
	}
}

export function projectBinary(
	expression: Ast.BinaryOperationExpression,
	ctx: Ctx,
): RawOperand {
	const equation = binaryMechanism(expression, ctx)
	return {
		id: expression.id,
		name: null,
		address: null,
		description: null,
		parameter: null,
		term: expressionText(ctx.ast, expression),
		named: null,
		value: equation.result,
		detail: finishEquation(equation, { ...ctx, depth: ctx.depth + 1 }, expression.id),
	}
}
