import { ActionData } from '@publicodes/worker'
import { usePromise } from '@publicodes/worker-react'
import { utils } from 'publicodes'
import { RuleLinkWithContext } from '../RuleLink'
import { executeAction, getSubEngineOrEngine } from '../actions'
import { useEngine, useSubEngineId } from '../hooks/useEngine'
import Meta from './Meta'

export const getRuleHeaderData = (
	{ engine: baseEngine }: ActionData,
	{ dottedName, subEngineId }: { dottedName: string; subEngineId?: number }
) => {
	const engine = getSubEngineOrEngine(baseEngine, subEngineId)

	return engine.context.parsedRules[dottedName]
}

export default function RuleHeader({ dottedName }) {
	const engine = useEngine()
	const subEngineId = useSubEngineId()

	const res = usePromise(
		() =>
			executeAction(engine, 'getRuleHeaderData', {
				dottedName,
				subEngineId,
			}),
		[engine, subEngineId, dottedName]
	)

	if (res === undefined) {
		return null
	}

	const { title, rawNode } = res
	const { description, question, icônes } = rawNode
	const displayTitle = icônes ? title + ' ' + icônes : title
	return (
		<header>
			<Meta title={displayTitle} description={description || question} />
			<div>
				<span id="rules-nav-open-nav-button">
					{/* Portal for OpenNavButton in RulesNav */}
				</span>
				{utils
					.ruleParents(dottedName)
					.reverse()
					.map((parentDottedName) => (
						<span key={parentDottedName}>
							<RuleLinkWithContext dottedName={parentDottedName} displayIcon />
							<span aria-hidden>{' › '}</span>
						</span>
					))}
			</div>
			<h1>
				<RuleLinkWithContext dottedName={dottedName} displayIcon />
			</h1>
		</header>
	)
}
