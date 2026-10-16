import type * as Ast from '../../ast'
import type {
	Ctx,
	EquationView,
	MechanismView,
	RawOperand,
} from '../types'
import { finishEquation } from '../operand'
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
	const done = (view: MechanismView | null, id: string) =>
		view === null ? null : finishEquation(view, ctx, id)
	switch (mechanism.kind) {
		case 'sum':
			return done(projectSum(node, mechanism, ctx), mechanism.id)
		case 'product':
			return done(projectProduct(node, mechanism, ctx), mechanism.id)
		case 'all_of':
			return done(projectAllOf(node, mechanism, ctx), mechanism.id)
		case 'one_of':
			return done(projectOneOf(node, mechanism, ctx), mechanism.id)
		case 'min_of':
			return done(projectMinOf(node, mechanism, ctx), mechanism.id)
		case 'max_of':
			return done(projectMaxOf(node, mechanism, ctx), mechanism.id)
		case 'variations':
			return done(projectVariations(node, mechanism, ctx), mechanism.id)
		case 'expr':
			return done(projectExpr(node, mechanism, ctx), mechanism.id)
		case 'value':
			return done(projectValueMechanism(node, mechanism, ctx), mechanism.id)
		case 'not_defined':
			return done(projectNotDefined(node, mechanism, ctx), mechanism.id)
		case 'is_applicable':
			return done(
				projectApplicability(node, mechanism, ctx, 'est applicable'),
				mechanism.id,
			)
		case 'is_not_applicable':
			return done(
				projectApplicability(node, mechanism, ctx, 'n’est pas applicable'),
				mechanism.id,
			)
		default:
			return mechanism satisfies never
	}
}

export function projectExpression(
	expression: Ast.Expression,
	ctx: Ctx,
): RawOperand {
	return expression.kind === 'constant' ? projectConstant(expression, ctx)
		: expression.kind === 'ref' ? projectRef(expression, ctx)
		: expression.kind === 'neg' ? projectUnary(expression, ctx)
		: projectBinary(expression, ctx)
}
