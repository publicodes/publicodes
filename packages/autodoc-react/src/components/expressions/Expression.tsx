import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ConstantExpression } from './ConstantExpression'
import { ReferenceExpression } from './ReferenceExpression'
import { BinaryExpression } from './BinaryExpression'
import { UnaryExpression } from './UnaryExpression'

export interface ExpressionProps {
	expression: Ast.Expression
	trace?: Trace
}

export function Expression({ expression, trace }: ExpressionProps): JSX.Element {
	switch (expression.kind) {
		case 'constant':
			return <ConstantExpression expression={expression} trace={trace} />
		case 'ref':
			return <ReferenceExpression expression={expression} trace={trace} />
		case 'add':
		case 'sub':
		case 'mul':
		case 'div':
		case 'pow':
		case 'gt':
		case 'lt':
		case 'gteq':
		case 'lteq':
		case 'eq':
		case 'noteq':
		case 'and':
		case 'or':
		case 'max':
		case 'min':
			return <BinaryExpression expression={expression} trace={trace} />
		case 'neg':
			return <UnaryExpression expression={expression} trace={trace} />
		default:
			return expression satisfies never
	}
}
