import Engine, { utils } from 'publicodes'
export { default as Explanation } from './Explanation'
export { default as RulePage } from './rule/RulePage'
export { RuleLink } from './RuleLink'

/**
 * Get all the URLs of the documentation pages and their corresponding rule names.
 *
 * @param engine - The engine instance containing the rules.
 * @param documentationPath - The base path of the documentation.
 * @returns A record of rule names indexed by their corresponding documentation URLs.
 *
 *
 * @example
 * ```ts
 * const engine = new Engine({
 *  'contrat salarié': undefined,
 *  'contrat salarié . rémunération': 2140,
 * })
 *
 * const documentationPath = '/doc'
 *
 * const siteMap = getDocumentationSiteMap({
 * 	engine,
 * 	documentationPath
 * })
 *
 * // siteMap will be: {
 * //   '/doc/contrat-salarié': 'contrat salarié',
 * //   '/doc/contrat-salarié/rémuneration': 'contrat salarié . rémunération'
 * // }
 * ```
 *
 */
export function getDocumentationSiteMap({
	engine,
	documentationPath,
}: {
	engine: Engine
	documentationPath: string
}): Record<string, string> {
	const parsedRules = engine.context.parsedRules
	return Object.fromEntries(
		Object.keys(parsedRules)
			.filter(
				(dottedName) =>
					!dottedName.match(/(\$SITUATION|\$EVALUATION|\$INTERNAL)/),
			)
			.map((dottedName) => [
				documentationPath + '/' + utils.encodeRuleName(dottedName),
				dottedName,
			]),
	)
}

export { type SupportedRenderers } from './contexts'
