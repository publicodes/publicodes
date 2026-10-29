import type * as Ast from './ast'
import { displayName } from './projection/names'
import { isRecord } from './record'

/**
 * The rule a context stack belongs to. A stack is the ids of the `contexte` mechanisms the
 * reader descended through — `-id1-id2` — and the outermost of them is the one whose rule
 * has to be evaluated for the trace to hold the stack: a page read under a stack takes its
 * trace from the rule that opened it, not from the rule it shows.
 */
export function contextOwner(
	ast: Ast.PublicodeAST,
	stack: string,
): string | null {
	const outermost = stack.split('-').filter(Boolean)[0]
	if (outermost === undefined) return null
	return ownersOf(ast).get(outermost) ?? null
}

const OWNERS = new WeakMap<object, Map<string, string>>()

/** Which rule writes each node of the model: the index a stack id is read through. */
const ownersOf = (ast: Ast.PublicodeAST): Map<string, string> => {
	const known = OWNERS.get(ast)
	if (known !== undefined) return known
	const owners = new Map<string, string>()
	for (const [rule, definition] of Object.entries(ast))
		for (const id of idsOf(definition)) owners.set(id, rule)
	OWNERS.set(ast, owners)
	return owners
}

const idsOf = (node: unknown): string[] => {
	if (Array.isArray(node)) return node.flatMap(idsOf)
	if (!isRecord(node)) return []
	const own = typeof node.id === 'string' ? [node.id] : []
	return [...own, ...Object.values(node).flatMap(idsOf)]
}

/** One step of the way back: the rule the reader was reading, and the stack to read it at. */
export interface ContextCrumb {
	/** The name the step reads as in the trail. */
	name: string
	/** The page the step leads to: the same rule, read under a shorter stack. */
	rule: string
	/** The stack to read it under; '' is the model's own. */
	stack: string
}

/**
 * The trail of contexts the reader descended through, from the model's own to the one the
 * page is read under. The last crumb is the page's; the first is where a reader lands when
 * they come back to the base context. A context a page declares for itself is not a step:
 * the base crumb already is that computation.
 */
export function contextCrumbs(
	ast: Ast.PublicodeAST,
	rule: string,
	stack: string,
): ContextCrumb[] {
	const crumbs: ContextCrumb[] = [
		{ name: displayName(ast, rule), rule, stack: '' },
	]
	let prefix = ''
	for (const id of stack.split('-').filter(Boolean)) {
		prefix = `${prefix}-${id}`
		const owner = contextOwner(ast, `-${id}`) ?? rule
		if (owner !== rule)
			crumbs.push({ name: displayName(ast, owner), rule, stack: prefix })
	}
	return crumbs
}
