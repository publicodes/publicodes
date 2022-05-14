import { EvaluatedNode } from 'publicodes/source/AST/types'
import styled from 'styled-components'
import Explanation from '../Explanation'
import { Mecanism } from './common'

export default function Product(node: EvaluatedNode) {
	const args = node.sourceMap?.args ?? {}
	return (
		<Mecanism name="produit" value={node.nodeValue} unit={node.unit}>
			<div
				style={{
					display: 'flex',
					alignItems: 'baseline',
					justifyContent: 'flex-start',
					flexWrap: 'wrap',
				}}
			>
				<div style={{ textAlign: 'right' }}>
					<Explanation node={args.assiette} />
					{args.plafond && (
						<PlafondSmall>
							<span>Plafonnée à :&nbsp;</span>
							<Explanation node={args.plafond} />
						</PlafondSmall>
					)}
				</div>
				{args.facteur && (
					<div
						style={{
							display: 'flex',
							alignItems: 'baseline',
						}}
					>
						<div style={{ fontSize: '110%', margin: '0 0.6rem' }}> × </div>
						<div>
							<Explanation node={args.facteur} />
						</div>
					</div>
				)}
				{args.taux && (
					<div
						style={{
							display: 'flex',
							alignItems: 'baseline',
							justifyContent: 'flex-end',
						}}
					>
						<div style={{ fontSize: '110%', margin: '0 0.6rem' }}> × </div>
						<Explanation node={args.taux} />
					</div>
				)}
			</div>
		</Mecanism>
	)
}

const PlafondSmall = styled.small`
	display: flex;
	border-left: 2px solid lightgray;
	padding-left: 0.5rem;
	align-items: baseline;
	flex-wrap: wrap;
`
