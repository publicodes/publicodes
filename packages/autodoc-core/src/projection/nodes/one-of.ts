import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { MECHANISM_NAMES } from '../mechanism-name'
import { projectList } from './list'

export const projectOneOf = (
	node: Ast.ChainedValue,
	mechanism: Ast.OneOfMechanism,
	ctx: Ctx,
): MechanismView =>
	projectList(node, mechanism, ctx, MECHANISM_NAMES.one_of, 'ou')
