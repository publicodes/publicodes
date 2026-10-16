import type * as Ast from '../../ast'
import type { Ctx, EquationView, MechanismView, RawOperand } from '../types'
import { finishEquation } from '../operand'
import {
	contextInside,
	contextModifier,
	contextOf,
	valueOfChain,
} from '../chained'
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
export function projectNode(
	node: Ast.ChainedValue,
	ctx: Ctx,
): EquationView | null {
	const mechanism = node.value_mechanism
	// The engine applies a chain in one order, and a `contexte` pushes a stack of its own:
	// the value and everything under it is traced there, while what the mechanism binds
	// stays on the caller's side. One push, then every projector reads where it was written.
	const under = contextInside(node, ctx)
	// the mechanism whose stack the lines below are read under, for a navigation from them
	const contextId = contextOf(node)?.id ?? null
	const done = (
		view: MechanismView | null,
		id: string,
	): EquationView | null => {
		if (view === null) return null
		const bound = contextModifier(node, under, ctx)
		const equation = finishEquation(
			{
				...view,
				result: valueOfChain(node, under, ctx) ?? view.result,
				modifiers: bound === null ? view.modifiers : [...view.modifiers, bound],
			},
			ctx,
			id,
		)
		return contextId === null ? equation : { ...equation, contextId }
	}
	switch (mechanism.kind) {
		case 'sum':
			return done(projectSum(node, mechanism, under), mechanism.id)
		case 'product':
			return done(projectProduct(node, mechanism, under), mechanism.id)
		case 'all_of':
			return done(projectAllOf(node, mechanism, under), mechanism.id)
		case 'one_of':
			return done(projectOneOf(node, mechanism, under), mechanism.id)
		case 'min_of':
			return done(projectMinOf(node, mechanism, under), mechanism.id)
		case 'max_of':
			return done(projectMaxOf(node, mechanism, under), mechanism.id)
		case 'variations':
			return done(projectVariations(node, mechanism, under), mechanism.id)
		case 'expr':
			return done(projectExpr(node, mechanism, under), mechanism.id)
		case 'value':
			return done(projectValueMechanism(node, mechanism, under), mechanism.id)
		case 'not_defined':
			return done(projectNotDefined(node, mechanism, under), mechanism.id)
		case 'is_applicable':
			return done(
				projectApplicability(node, mechanism, under, 'est applicable'),
				mechanism.id,
			)
		case 'is_not_applicable':
			return done(
				projectApplicability(
					node,
					mechanism,
					under,
					'n’est pas applicable',
				),
				mechanism.id,
			)
		case 'is_defined':
			return done(
				projectApplicability(node, mechanism, under, 'est défini'),
				mechanism.id,
			)
		case 'is_not_defined':
			return done(
				projectApplicability(
					node,
					mechanism,
					under,
					'n’est pas défini',
				),
				mechanism.id,
			)
		case 'average':
			// @todo
			return null
		default:
			return mechanism satisfies never
	}
}

export function projectExpression(
	expression: Ast.Expression,
	ctx: Ctx,
): RawOperand {
	return (
		expression.kind === 'constant' ? projectConstant(expression, ctx)
		: expression.kind === 'ref' ? projectRef(expression, ctx)
		: expression.kind === 'neg' ? projectUnary(expression, ctx)
		: projectBinary(expression, ctx)
	)
}
