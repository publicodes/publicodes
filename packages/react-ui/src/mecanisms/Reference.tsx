import { EvaluatedNode } from 'publicodes/src/AST/types'
import { createContext, useContext, useState } from 'react'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { EngineContext } from '../contexts'
import { NodeValueLeaf } from './common/NodeValueLeaf'

// Un élément du graphe de calcul qui a une valeur interprétée (à afficher)
export default function Reference(
	node: EvaluatedNode<'reference'> & {
		dottedName: string
	},
) {
	const engine = useContext(EngineContext)
	const { dottedName, nodeValue, unit } = node
	const rule = engine?.context.parsedRules[node.dottedName]
	if (!rule) {
		throw new Error(`Unknown rule: ${dottedName}`)
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
			<div
				style={{
					display: 'flex',
					alignItems: 'baseline',
					flexWrap: 'wrap',
					justifyContent: 'space-between',
				}}
			>
				<span style={{ paddingRight: '0.2rem' }}>
					<RuleLinkWithContext dottedName={dottedName} />
				</span>

				<div
					style={{
						flex: 1,

						display: 'flex',
						alignItems: 'baseline',
					}}
				>
					{isFoldEnabled && (
						<>
							<UnfoldButton
								onClick={() => setFolded(!folded)}
								aria-expanded={!folded}
								className="publicodes_btn-small"
								aria-label={
									folded ?
										'Déplier, afficher le détail'
									:	'Replier, afficher le détail'
								}
							>
								{folded ? 'Déplier' : 'Replier'}
							</UnfoldButton>
							<StyledGuide />
						</>
					)}

					{nodeValue !== undefined && (
						<NodeValueLeaf data={nodeValue} unit={unit} />
					)}
				</div>
			</div>{' '}
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
`
const StyledGuide = styled.div`
	@media (max-width: 500px) {
		/* border: none; */
	}
	margin: 0.5rem;
	flex: 1;
	border-bottom: 2px dotted lightgray;
`
