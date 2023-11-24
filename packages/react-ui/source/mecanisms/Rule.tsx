import { capitalise0 } from 'publicodes'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { DottedNameContext } from '../contexts'

export default function RuleMecanism({
	rawNode,
	explanation,
	dottedName,
	title,
	virtualRule,
}) {
	return (
		<Styled>
			<DottedNameContext.Provider value={dottedName}>
				<small>{capitalise0(title)}</small>
				<StyledExplanation>
					<Explanation node={explanation.valeur} />
				</StyledExplanation>
			</DottedNameContext.Provider>
		</Styled>
	)
}

const Styled = styled.div`
	display: flex;
	flex-direction: column;

	border-top-left-radius: 3px;
	margin: 1rem 0;
	> small {
		align-self: flex-start;
		padding: 0.125rem 0.5rem;
		border: 1px solid #18457b;
		border-bottom: none;
		position: relative;
		color: #18457b;
		border-top-right-radius: 3px;
		border-top-left-radius: 3px;
		background-color: white;
	}
`

const StyledExplanation = styled.div`
	border: 1px solid #18457b;
	padding: 1rem;
`
