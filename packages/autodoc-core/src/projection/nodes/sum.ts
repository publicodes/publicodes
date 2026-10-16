import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { projectList } from './list'

export const projectSum = (
	node: Ast.ChainedValue,
	mechanism: Ast.SumMechanism,
	ctx: Ctx,
): MechanismView => projectList(node, mechanism, ctx, 'somme', '+')
