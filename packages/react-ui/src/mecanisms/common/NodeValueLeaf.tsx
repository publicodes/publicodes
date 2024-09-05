import { Evaluation, Unit, formatValue } from 'publicodes'
import { styled } from 'styled-components'

type Props = {
	data: Evaluation
	unit: Unit | undefined
	fullPrecision?: boolean
}

export const NodeValueLeaf = ({ data, unit }: Props) => {
	return (
		<StyledNodeValuePointer
			className="node-value-pointer"
			title={data === null ? 'Non applicable' : ''}
			aria-label={data === null ? 'Valeur non applicable' : ''}
		>
			{data === null ?
				<span aria-hidden>-</span>
			:	formatValue({ nodeValue: data, unit })}
		</StyledNodeValuePointer>
	)
}

const StyledNodeValuePointer = styled.span`
	background: white;
	border-bottom: 0 !important;
	font-size: 0.875rem;
	line-height: 1.25rem;
	margin: 0 0.2rem;
	flex-shrink: 0;
	padding: 0.1rem 0.2rem;
	text-decoration: none !important;
	box-shadow:
		0px 1px 2px 1px #d9d9d9,
		0 0 0 1px #d9d9d9;
	border: 1px solid #f8f9fa;
	border-radius: 0.2rem;
`
