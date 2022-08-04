import { utils } from 'publicodes'
import { useContext } from 'react'
import { EngineContext } from '../contexts'
import { RuleLinkWithContext } from '../RuleLink'
import Meta from './Meta'

export default function RuleHeader({ dottedName }) {
	const engine = useContext(EngineContext)
	if (!engine) {
		throw new Error('an engine should be provided in context')
	}
	const {
		title,
		rawNode: { description, question, icônes },
	} = engine.context.parsedRules[dottedName]
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
							{' › '}
						</span>
					))}
			</div>
			<h1>
				<RuleLinkWithContext dottedName={dottedName} displayIcon />
			</h1>
		</header>
	)
}
