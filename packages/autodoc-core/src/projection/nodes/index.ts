import type * as Ast from '../../ast'
import type { Ctx, EquationView, OperandView } from '../types'
import { projectAllOf } from './all-of'
import { projectApplicability } from './applicability'
import { projectBinary } from './binary'
import { projectConstant } from './constant'
import { projectExpr } from './expression'
import { projectMaxOf } from './max-of'
import { projectMinOf } from './min-of'
import { projectNotDefined } from './not-defined'
import { projectOneOf } from './one-of'
import { projectProduct } from './product'
import { projectRef } from './ref'
import { projectSum } from './sum'
import { projectUnary } from './unary'
import { projectValueMechanism } from './value-mechanism'
import { projectVariations } from './variations'

/**
 * The dispatch over the AST's discriminated unions. Every member is handled
 * and the default is unreachable, so a new mechanism kind is a compile error
 * here rather than a silent gap on the page.
 */
export function projectNode(node: Ast.ChainedValue, ctx: Ctx): EquationView | null {
	const mechanism = node.value_mechanism
	switch (mechanism.kind) {
		case 'sum':
			return projectSum(node, mechanism, ctx)
		case 'product':
			return projectProduct(node, mechanism, ctx)
		case 'all_of':
			return projectAllOf(node, mechanism, ctx)
		case 'one_of':
			return projectOneOf(node, mechanism, ctx)
		case 'min_of':
			return projectMinOf(node, mechanism, ctx)
		case 'max_of':
			return projectMaxOf(node, mechanism, ctx)
		case 'variations':
			return projectVariations(node, mechanism, ctx)
		case 'expr':
			return projectExpr(node, mechanism, ctx)
		case 'value':
			return projectValueMechanism(node, mechanism, ctx)
		case 'not_defined':
			return projectNotDefined(node, mechanism, ctx)
		case 'is_applicable':
			return projectApplicability(node, mechanism, ctx, 'est applicable')
		case 'is_not_applicable':
			return projectApplicability(node, mechanism, ctx, 'n’est pas applicable')
		default:
			return mechanism satisfies never
	}
}

export function projectExpression(
	expression: Ast.Expression,
	ctx: Ctx,
	operator: string | null,
): OperandView {
	switch (expression.kind) {
		case 'constant':
			return projectConstant(expression, ctx, operator)
		case 'ref':
			return projectRef(expression, ctx, operator)
		case 'neg':
			return projectUnary(expression, ctx, operator)
		default:
			return projectBinary(expression, ctx, operator)
	}
}
