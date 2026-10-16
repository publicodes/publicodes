import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { MECHANISM_NAMES } from '../mechanism-name'
import { projectList } from './list'

export const projectMaxOf = (
	node: Ast.ChainedValue,
	mechanism: Ast.MaxOfMechanism,
	ctx: Ctx,
): MechanismView => projectList(node, mechanism, ctx, MECHANISM_NAMES.max_of, '')
