import type * as Ast from '../ast'

/**
 * The rules that consume this one, as the compiler computed them. The renderer
 * never walks the tree to find them.
 */
export const projectUsedBy = (rule: Ast.RuleDefinition): string[] =>
	rule.referenced_by ?? []
