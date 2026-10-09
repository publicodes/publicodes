import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { projectList } from './list'

export const projectAllOf = (
	node: Ast.ChainedValue,
	mechanism: Ast.AllOfMechanism,
	ctx: Ctx,
): EquationView => projectList(node, mechanism, ctx, 'toutes ces conditions', 'et')
