import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { MECHANISM_NAMES } from '../mechanism-name'
import { projectList } from './list'

export const projectAllOf = (
	node: Ast.ChainedValue,
	mechanism: Ast.AllOfMechanism,
	ctx: Ctx,
): MechanismView => projectList(node, mechanism, ctx, MECHANISM_NAMES.all_of, 'et')
