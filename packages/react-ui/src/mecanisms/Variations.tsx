import { EvaluatedNode } from 'publicodes'
import { useState } from 'react'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { Mecanism } from './common/Mecanism'

type Props = EvaluatedNode<'variations'>

export default function Variations({ nodeValue, explanation, unit }: Props) {
	const activeCaseIndex = explanation.findIndex(
		({ condition }) => (condition as EvaluatedNode).nodeValue === true,
	)

	let activeCase
	if (activeCaseIndex !== undefined) {
		activeCase = explanation[activeCaseIndex]
		explanation = [
			...explanation.slice(0, activeCaseIndex),
			...explanation.slice(activeCaseIndex + 1),
		]
	}

	const [isExpanded, setIsExpanded] = useState(!activeCase)
	return (
		<Mecanism name="variations" unit={unit} value={nodeValue}>
			<ul>
				{activeCase && (
					<li>
						<Case {...(activeCase as CaseProps)} />
						<span style={{ paddingLeft: '1rem' }}>
							<button
								className="publicodes_btn-small"
								onClick={() => setIsExpanded(!isExpanded)}
							>
								{isExpanded ? 'Masquer' : 'Afficher'} les autres cas
							</button>
						</span>
					</li>
				)}
				{isExpanded && (
					<>
						{explanation.map((currentCase, i) => (
							<li key={i}>
								<Case {...(currentCase as CaseProps)} />
							</li>
						))}
					</>
				)}
			</ul>
		</Mecanism>
	)
}

type CaseProps = {
	condition: EvaluatedNode
	consequence: EvaluatedNode
}
function Case({ condition, consequence }: CaseProps) {
	return (
		<StyledCaseContainer>
			<StyledCase>
				<StyledCondition>
					{condition.nodeKind === 'constant' && condition.nodeValue === true ?
						<StyledText>Par défaut&nbsp;:&nbsp;</StyledText>
					:	<>
							<StyledText>Condition&nbsp;:&nbsp;</StyledText>
							<StyledExplanation>
								<Explanation node={condition} />
							</StyledExplanation>
						</>
					}
				</StyledCondition>
				<StyledExplanation>
					<Explanation node={consequence} />
				</StyledExplanation>
			</StyledCase>
		</StyledCaseContainer>
	)
}

const StyledExplanation = styled.div``
const StyledText = styled.span`
	font-weight: bold;
`
const StyledCondition = styled.div`
	padding-bottom: 1rem;
	padding-top: 0.5rem;
	display: flex;
	align-items: baseline;
`

const StyledCase = styled.div`
	border-left: 1rem solid hsl(36, 60%, 97%);
	padding-left: 1rem;
	margin-left: -1rem;
`

const StyledCaseContainer = styled.div`
	padding: 1rem 0;
`
