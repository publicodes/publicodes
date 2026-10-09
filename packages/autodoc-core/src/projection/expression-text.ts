import type * as Ast from '../ast'
import { needsParens } from '../binary-expression'
import { formatValue } from '../format-value'
import { displayName } from './names'

const OPERATOR_TEXT: Record<Ast.BinaryOperationExpression['kind'], string> = {
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

const constantText = (
	parameters: NonNullable<Ast.ConstantExpression['parameters']>,
): string => {
	switch (parameters.kind) {
		case 'const_boolean':
			return parameters.value ? 'oui' : 'non'
		case 'const_text':
			return `« ${parameters.value} »`
		case 'const_date':
			return parameters.value
		case 'const_number':
			return formatValue(parameters.value, {
				type: 'number',
				unit: parameters.unit,
			})
		default:
			return parameters satisfies never
	}
}

/**
 * An expression written as notation: the author's own rule names, the operator
 * glyphs, and parentheses only where precedence needs them. Used wherever an
 * expression has to be shown rather than computed — a condition, a consequence.
 */
export function expressionText(
	ast: Ast.PublicodeAST,
	expression: Ast.Expression,
): string {
	switch (expression.kind) {
		case 'constant':
			return expression.parameters ? constantText(expression.parameters) : ''
		case 'ref':
			return displayName(ast, expression.parameters)
		case 'neg':
			return `−${expressionText(ast, expression.parameters)}`
		default: {
			const { left, right } = expression.parameters
			const leftText = expressionText(ast, left)
			const rightText = expressionText(ast, right)
			const leftOut =
				needsParens(expression.kind, left.kind, 'left') ? `(${leftText})` : leftText
			const rightOut =
				needsParens(expression.kind, right.kind, 'right') ? `(${rightText})` : rightText
			return `${leftOut} ${OPERATOR_TEXT[expression.kind]} ${rightOut}`
		}
	}
}
