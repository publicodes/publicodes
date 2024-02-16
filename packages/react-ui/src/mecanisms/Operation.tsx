import { EvaluatedNode } from 'publicodes'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { NodeValueLeaf } from './common/NodeValueLeaf'

type Props = EvaluatedNode<'operation'> & {
	explanation: [EvaluatedNode, EvaluatedNode]
}

export default function Operation({
	nodeValue,
	explanation,
	operator,
	unit,
}: Props) {
	const isUnaryOperation =
		explanation[0].nodeValue === 0 &&
		operator === '−' &&
		explanation[0].nodeKind === 'constant'

	return (
		<StyledOperation className="operation" role="math">
			<span>(</span>
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
					<NodeValueLeaf data={nodeValue} unit={unit} />
				</span>
			)}
			<span>)</span>
		</StyledOperation>
	)
}

const StyledOperation = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.125rem;
	> .operation ::before,
	> .operation ::after {
		content: '';
	}
	.result {
		margin-left: 0.2rem;
	}
	.operation .result {
		display: none;
	}
`
