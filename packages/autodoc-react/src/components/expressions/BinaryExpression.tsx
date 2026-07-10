import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { needsParens } from '@publicodes/autodoc-core'
import { Expression } from './Expression'

export interface BinaryExpressionProps {
	expression: Ast.BinaryOperationExpression
	trace?: Trace
}

const OPERATOR: Record<Ast.BinaryOperationExpression['kind'], string> = {
	add: '+',
	sub: '-',
	mul: '×',
	div: '/',
	pow: '↑',
	gt: '>',
	lt: '<',
	gteq: '≥',
	lteq: '≤',
	eq: '=',
	noteq: '≠',
	and: 'ET',
	or: 'OU',
	max: 'max',
	min: 'min',
}

function needsChildParens(
	parentKind: string,
	child: Ast.Expression,
	side: 'left' | 'right',
): boolean {
	if (child.kind === 'ref' || child.kind === 'constant') return false
	return needsParens(parentKind, child.kind, side)
}

export function BinaryExpression({
	expression,
	trace,
}: BinaryExpressionProps): JSX.Element {
	const { left, right } = expression.parameters
	const operator = OPERATOR[expression.kind]

	const leftParens = needsChildParens(expression.kind, left, 'left')
	const rightParens = needsChildParens(expression.kind, right, 'right')

	return (
		<span
			className={`publicodes-expression publicodes-expression--${expression.kind}`}
		>
			{leftParens && <span className="publicodes-expression--paren">(</span>}
			<Expression expression={left} trace={trace} />
			{leftParens && <span className="publicodes-expression--paren">)</span>}
			{' '}
			<span className="publicodes-expression__operator">{operator}</span>
			{' '}
			{rightParens && <span className="publicodes-expression--paren">(</span>}
			<Expression expression={right} trace={trace} />
			{rightParens && <span className="publicodes-expression--paren">)</span>}
		</span>
	)
}
