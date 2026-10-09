import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { projectList } from './list'

export const projectMinOf = (
	node: Ast.ChainedValue,
	mechanism: Ast.MinOfMechanism,
	ctx: Ctx,
): EquationView => projectList(node, mechanism, ctx, 'le plus petit de', '')
