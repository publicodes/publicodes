import type * as Ast from '../../ast'
import { formatValue } from '../../format-value'
import type { Ctx, RawOperand } from '../types'
import { expressionText } from '../expression-text'
import { formatSupplied, lookupValue, unitOf } from '../value'

/** Ce que le littéral vaut, sans passer par la trace : il n'a rien d'autre à dire. */
const literalOf = (expression: Ast.ConstantExpression) => {
	const parameters = expression.parameters
	switch (parameters?.kind) {
		case 'const_number':
		case 'const_text':
		case 'const_symbol':
		case 'const_boolean':
			return parameters.value
		case 'const_date':
			return new Date(parameters.value)
		default:
			return undefined
	}
}

/** A literal is worth what it says; there is nothing else to decide about it. */
export function projectConstant(
	expression: Ast.ConstantExpression,
	ctx: Ctx,
): RawOperand {
	const parameters = expression.parameters
	const term = expressionText(ctx.ast, expression)
	const read = lookupValue(
		ctx,
		expression.id,
		expression.type,
		unitOf(expression),
	)
	const literal = literalOf(expression)
	// le moteur n'écrit pas de trace pour un littéral : sa valeur est ce qu'il dit
	const value =
		read.state === 'absent' && literal !== undefined ?
			{
				state: 'value' as const,
				value: literal,
				text: formatSupplied(literal, expression.type, unitOf(expression)),
			}
		:	read
	return {
		id: null,
		name: null,
		address: null,
		description: null,
		term:
			parameters?.kind === 'const_number' ?
				formatValue(parameters.value, {
					type: 'number',
					unit: unitOf(expression),
				})
			:	term,
		named: null,
		value,
		detail: null,
	}
}
