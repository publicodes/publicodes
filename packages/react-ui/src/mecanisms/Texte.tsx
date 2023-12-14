import { styled } from 'styled-components'
import Explanation from '../Explanation'

export default function Texte({ nodeValue, unit, explanation }) {
	return (
		<p>
			{explanation.map((element) =>
				typeof element === 'string' ? element : (
					<Highlight>
						<Explanation node={element} />
					</Highlight>
				),
			)}
		</p>
	)
}

const Highlight = styled.span`
	border: 1px solid rgba(0, 0, 0, 0.1);
	padding: 0.2rem;
	position: relative;
	border-radius: 0.15rem;
	background-color: rgba(0, 0, 0, 0.05);
`
