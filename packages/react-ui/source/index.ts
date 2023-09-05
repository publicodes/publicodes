import { ActionData } from '@publicodes/worker'
import { WorkerEngine, usePromise } from '@publicodes/worker-react'
import Engine, { utils } from 'publicodes'
import { executeAction } from './actions'

export { default as Explanation } from './Explanation'
export { RuleLink } from './RuleLink'
export { PublicodesReactActions, publicodesReactActions } from './actions'
export { default as RulePage } from './rule/RulePage'

export function getDocumentationSiteMap(
	{ engine }: ActionData,
	{ documentationPath }: { documentationPath: string }
) {
	const parsedRules = engine.context.parsedRules
	return Object.fromEntries(
		Object.keys(parsedRules).map((dottedName) => [
			documentationPath + '/' + utils.encodeRuleName(dottedName),
			dottedName,
		])
	)
}

export const useDocumentationSiteMap = (
	engine: Engine | WorkerEngine,
	documentationPath: string
) =>
	usePromise(
		() =>
			executeAction(engine, 'getDocumentationSiteMap', { documentationPath }),
		[engine, documentationPath]
	)
