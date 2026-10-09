import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { projectList } from './list'

export const projectOneOf = (
	node: Ast.ChainedValue,
	mechanism: Ast.OneOfMechanism,
	ctx: Ctx,
): EquationView => projectList(node, mechanism, ctx, 'une de ces conditions', 'ou')
