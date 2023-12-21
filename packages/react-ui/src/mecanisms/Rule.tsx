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
				<StyledExplanation>
					<Explanation node={explanation.valeur} />
				</StyledExplanation>
			</DottedNameContext.Provider>
		</Styled>
	)
}
const StyledExplanation = styled.div`
	border-left: 1rem solid hsl(220, 60%, 97.5%);
	padding-left: 1rem;
	margin-left: -2rem;
`

const Styled = styled.div`
	margin-top: 0.5rem;
	margin-bottom: 1rem;
	display: flex;
	flex-direction: column;
`
