import { utils } from 'publicodes'
export { default as Explanation } from './Explanation'
export { RuleLink } from './RuleLink'
export { default as RulePage } from './rule/RulePage'

export function getDocumentationSiteMap({ engine, documentationPath }) {
	const parsedRules = engine.context.parsedRules
	return Object.fromEntries(
		Object.keys(parsedRules)
			.filter(
				(dottedName) =>
					!dottedName.match(/(\$SITUATION|\$EVALUATION|\$INTERNAL)/)
			)
			.map((dottedName) => [
				documentationPath + '/' + utils.encodeRuleName(dottedName),
				dottedName,
			])
	)
}
