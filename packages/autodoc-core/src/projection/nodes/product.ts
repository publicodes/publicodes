import type * as Ast from '../../ast'
import type { Ctx, MechanismView } from '../types'
import { projectList } from './list'

export const projectProduct = (
	node: Ast.ChainedValue,
	mechanism: Ast.ProductMechanism,
	ctx: Ctx,
): MechanismView => projectList(node, mechanism, ctx, 'produit', '×')
