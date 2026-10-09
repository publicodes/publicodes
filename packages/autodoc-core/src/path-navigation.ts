/**
 * Path navigation: the correspondence between a rule and the URL of its page.
 *
 * The route set is the model's declared API — its `public` rules (the compiled
 * module's outputs) and the parameters those rules transitively need. Renaming
 * anything else is not a breaking change, so nothing else gets a promised URL.
 */

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

/**
 * The inverse of {@link encodeRuleName}.
 */
export function decodeRuleName(encoded: string): string {
	return encoded
		.replace(/\//g, ' . ')
		.replace(/-/g, ' ')
		.replace(/\u2011/g, '-')
}

export interface PathNavigationRoute {
	rule: string
	path: string
	role: 'output' | 'parameter'
}

export interface PathNavigation {
	/** Every route, outputs first. */
	readonly routes: readonly PathNavigationRoute[]
	/** The path of a rule, or null when the model gives it no page. */
	pathOf(rule: string): string | null
	/** The rule a path belongs to, or null. */
	ruleOf(path: string): string | null
}

type NameSource = Record<string, unknown> | readonly string[]

const namesOf = (source: NameSource): string[] =>
	Array.isArray(source) ? [...source] : Object.keys(source)

/**
 * Builds the path navigation of a model from the compiled module's own
 * `outputs` and `parameters` exports, which are the rules the compiler derived
 * from the model's `public` tags.
 */
export function createPathNavigation({
	outputs,
	parameters,
	basePath = '',
}: {
	outputs: NameSource
	parameters: NameSource
	basePath?: string
}): PathNavigation {
	const base = basePath.replace(/\/+$/, '')
	const routes: PathNavigationRoute[] = [
		...namesOf(outputs).map((rule) => ({
			rule,
			path: `${base}/${encodeRuleName(rule)}`,
			role: 'output' as const,
		})),
		...namesOf(parameters).map((rule) => ({
			rule,
			path: `${base}/${encodeRuleName(rule)}`,
			role: 'parameter' as const,
		})),
	]
	const byRule = new Map(routes.map((route) => [route.rule, route.path]))
	const byPath = new Map(routes.map((route) => [route.path, route.rule]))

	return {
		routes,
		pathOf: (rule) => byRule.get(rule) ?? null,
		ruleOf: (path) => byPath.get(path) ?? null,
	}
}
