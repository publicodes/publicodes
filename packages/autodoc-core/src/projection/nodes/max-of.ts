import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { projectList } from './list'

export const projectMaxOf = (
	node: Ast.ChainedValue,
	mechanism: Ast.MaxOfMechanism,
	ctx: Ctx,
): EquationView => projectList(node, mechanism, ctx, 'le plus grand de', '')
