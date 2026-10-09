import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { projectList } from './list'

export const projectSum = (
	node: Ast.ChainedValue,
	mechanism: Ast.SumMechanism,
	ctx: Ctx,
): EquationView => projectList(node, mechanism, ctx, 'somme', '+')
