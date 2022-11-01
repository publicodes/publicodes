import styled from 'styled-components'
import Explanation from '../Explanation'
import { NodeValuePointer } from './common'

export default function Operation({ nodeValue, explanation, operator, unit }) {
	const isUnaryOperation =
		explanation[0].nodeValue === 0 &&
		operator === '−' &&
		explanation[0].nodeKind === 'constant'

	return (
		<StyledOperation className="operation">
			{!isUnaryOperation && (
				<>
					<Explanation node={explanation[0]} />
					&nbsp;
				</>
			)}
			{operator}&nbsp;
			<Explanation node={explanation[1]} />
			{nodeValue != undefined && (
				<span className="result">
					<small> =&nbsp;</small>
					<NodeValuePointer data={nodeValue} unit={unit} />
				</span>
			)}
		</StyledOperation>
	)
}

const StyledOperation = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.125rem;
	::before {
		content: '(';
	}
	> .operation ::before,
	> .operation ::after {
		content: '';
	}
	::after {
		content: ')';
	}
	.result {
		margin-left: 0.2rem;
	}
	.operation .result {
		display: none;
	}
`
