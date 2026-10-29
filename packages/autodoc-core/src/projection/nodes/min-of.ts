import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { MECHANISM_NAMES } from '../mechanism-name'
import { projectList } from './list'

export const projectMinOf = (
	node: Ast.ChainedValue,
	mechanism: Ast.MinOfMechanism,
	ctx: Ctx,
): MechanismView =>
	projectList(node, mechanism, ctx, MECHANISM_NAMES.min_of, '')
