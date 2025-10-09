import { EvaluatedNode } from 'publicodes'
import { createContext, useContext, useState } from 'react'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { EngineContext } from '../contexts'
import { NodeValueLeaf } from './common/NodeValueLeaf'
import { useHideValue } from '../hooks'
import { Arrow } from '../component/icons/Arrow'

// Un élément du graphe de calcul qui a une valeur interprétée (à afficher)
export default function Reference(
	node: EvaluatedNode<'reference'> & {
		dottedName: string
	},
) {
	const engine = useContext(EngineContext)
	const { dottedName, nodeValue, unit } = node
	const rule = engine?.context.parsedRules[node.dottedName]

	const hideValue = useHideValue(dottedName)

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

	const buttonTitle = `${
		folded ? 'Déplier, afficher le détail' : 'Replier, cacher le détail'
	} pour ${dottedName}`

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
				<h2 style={{ paddingRight: '0.2rem', margin: 0, display: 'inline' }}>
					<RuleLinkWithContext dottedName={dottedName} />
				</h2>

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
								aria-label={buttonTitle}
								title={buttonTitle}
							>
								{folded ? 'Déplier' : 'Replier'} <StyledArrow $open={!folded} />
							</UnfoldButton>
							<StyledGuide />
						</>
					)}

					{nodeValue !== undefined && (
						<NodeValueLeaf data={nodeValue} unit={unit} hideValue={hideValue} />
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
	border: solid 1px black;
	border-radius: 4px;
	padding: 2px 4px;
	margin-left: 4px;
	font-size: 14px;
	cursor: pointer;
	display: flex;
	align-items: center;
`
const StyledGuide = styled.div`
	@media (max-width: 500px) {
		/* border: none; */
	}
	margin: 0.5rem;
	flex: 1;
	border-bottom: 2px dotted lightgray;
`

const StyledArrow = styled(Arrow)<{ $open: boolean }>`
	width: 12px;
	height: 12px;
	transition: transform 0.1s;
	margin-left: 4px;
	transform: rotate(${({ $open }) => ($open ? '-180deg' : '0deg')});
`
