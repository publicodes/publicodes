import { EvaluatedNode } from 'publicodes/source/AST/types'
import { ReferenceNode } from 'publicodes/source/reference'
import { createContext, useContext, useState } from 'react'
import styled from 'styled-components'
import { EngineContext } from '../contexts'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { NodeValuePointer } from './common'

// Un élément du graphe de calcul qui a une valeur interprétée (à afficher)
export default function Reference(
	node: ReferenceNode & {
		dottedName: string
	} & EvaluatedNode
) {
	const engine = useContext(EngineContext)
	const { dottedName, nodeValue, unit } = node
	const rule = engine?.context.parsedRules[node.dottedName]
	if (!rule) {
		throw new Error('Unknown node')
	}
	const [folded, setFolded] = useState(true)
	const isFoldEnabled = useContext(UnfoldIsEnabledContext)

	if (
		node.dottedName === node.contextDottedName + ' . ' + node.name &&
		!node.name.includes(' . ') &&
		rule.virtualRule
	) {
		return <Explanation node={engine?.evaluate(rule)} />
	}
	return (
		<div
			style={{
				display: 'flex',
				flex: isFoldEnabled ? 1 : 'initial',
				flexDirection: 'column',
				maxWidth: '100%',
			}}
		>
			<span
				style={{
					display: 'flex',
					alignItems: 'baseline',
					flexWrap: 'wrap',
					justifyContent: 'space-between',
				}}
			>
				<RuleLinkWithContext dottedName={dottedName}>
					<span>
						{rule.rawNode.acronyme ? (
							<abbr title={rule.title}>{rule.rawNode.acronyme}</abbr>
						) : (
							rule.title
						)}
					</span>
				</RuleLinkWithContext>
				<div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
					{isFoldEnabled && (
						<>
							<UnfoldButton onClick={() => setFolded(!folded)}>
								{folded ? 'déplier' : 'replier'}
							</UnfoldButton>
							<StyledGuide />
						</>
					)}

					{nodeValue !== undefined && (
						<NodeValuePointer data={nodeValue} unit={unit} />
					)}
				</div>
			</span>{' '}
			{!folded && (
				<div>
					<UnfoldIsEnabledContext.Provider value={false}>
						<Explanation node={engine?.evaluate(rule)} />
					</UnfoldIsEnabledContext.Provider>
				</div>
			)}
		</div>
	)
}

export const UnfoldIsEnabledContext = createContext<boolean>(false)

const UnfoldButton = styled.button`
	text-transform: none !important;
	margin-left: 0.5rem;
`
const StyledGuide = styled.div`
	@media (max-width: 500px) {
		/* border: none; */
	}
	margin: 0.5rem;
	flex: 1;
	border-bottom: 2px dotted lightgray;
`
