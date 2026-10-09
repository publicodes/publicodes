import type * as Ast from '../../ast'
import type { Ctx, EquationView } from '../types'
import { projectList } from './list'

export const projectProduct = (
	node: Ast.ChainedValue,
	mechanism: Ast.ProductMechanism,
	ctx: Ctx,
): EquationView => projectList(node, mechanism, ctx, 'produit', '×')
