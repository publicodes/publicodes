/**
 * Path navigation: the correspondence between a rule and the URL of its page.
 *
 * The route set is the model's declared API — its `public` rules (the compiled
 * module's outputs) and the parameters those rules transitively need. Renaming
 * anything else is not a breaking change, so nothing else gets a promised URL.
 */

import { namesOf, nameOf, type NameSource } from './declared-api'

/**
 * The URL encoding of a dotted name, identical to the v1 renderer's, so a
 * documentation URL written by `@publicodes/react-ui` still resolves here.
 */
export function encodeRuleName(dottedName: string): string {
	return dottedName
		.replace(/\s\.\s/g, '/')
		.replace(/-/g, '\u2011')
		.replace(/\s/g, '-')
}

export interface PathNavigationRoute {
	rule: string
	path: string
	role: 'output' | 'parameter'
	/** The name an index prints for it. */
	name: string
}

export interface PathNavigation {
	/** What every path is prefixed with, without its trailing slash. */
	readonly basePath: string
	/**
	 * The link to a rule's page, under the stack the reader is reading. The stack travels in
	 * the URL: a link a reader shares shows them the computation it showed them.
	 */
	href: (rule: string, stack: string) => string
	/** Every route, outputs first. */
	readonly routes: readonly PathNavigationRoute[]
	/** The path of a rule, or null when the model gives it no page. */
	pathOf: (rule: string) => string | null
	/** The rule a path belongs to, or null. */
	ruleOf: (path: string) => string | null
}

/**
 * Builds the path navigation of a model from the compiled module's own
 * `outputs` and `parameters` exports, which are the rules the compiler derived
 * from the model's `public` tags.
 */
export function createPathNavigation({
	outputs,
	parameters,
	basePath = '',
	toUrl = (path: string) => path,
}: {
	outputs: NameSource
	parameters: NameSource
	basePath?: string
	/** How the host writes a path: a hash, a mount point, a prefix. */
	toUrl?: (path: string) => string
}): PathNavigation {
	const base = basePath.replace(/\/+$/, '')
	const route = (
		rule: string,
		source: NameSource,
		role: PathNavigationRoute['role'],
	): PathNavigationRoute => ({
		rule,
		path: `${base}/${encodeRuleName(rule)}`,
		role,
		name: nameOf(rule, source),
	})
	const routes: PathNavigationRoute[] = [
		...namesOf(outputs).map((rule) => route(rule, outputs, 'output')),
		...namesOf(parameters).map((rule) => route(rule, parameters, 'parameter')),
	]
	const byRule = new Map(routes.map((route) => [route.rule, route.path]))
	const byPath = new Map(routes.map((route) => [route.path, route.rule]))

	const pathOf = (rule: string): string | null => byRule.get(rule) ?? null
	return {
		basePath: base,
		href: (rule, stack) =>
			toUrl(
				stack === '' ?
					(pathOf(rule) ?? `${base}/${encodeRuleName(rule)}`)
				:	`${pathOf(rule) ?? `${base}/${encodeRuleName(rule)}`}?ctx=${encodeURIComponent(stack)}`,
			),
		routes,
		pathOf,
		ruleOf: (path) => byPath.get(path) ?? null,
	}
}

/** The stack a URL carries, or '' when it names none. */
export function contextStackFromUrl(url: string): string {
	const query = url.slice(url.indexOf('?') + 1)
	if (url.indexOf('?') === -1) return ''
	for (const pair of query.split('&')) {
		const [key, value = ''] = pair.split('=')
		if (key === 'ctx') return decodeURIComponent(value)
	}
	return ''
}
