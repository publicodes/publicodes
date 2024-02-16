import { EvaluatedNode, parseUnit } from 'publicodes'
import { NodeKind } from 'publicodes/src/AST/types'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { Mecanism } from './common/Mecanism'
import { NodeValueLeaf } from './common/NodeValueLeaf'

type EvaluatedTranche =
	EvaluatedNode<'barème'>['explanation']['tranches'][number] &
		EvaluatedNode & {
			plafond: EvaluatedNode
		}

export type BaremeExplanation = {
	tranches: Array<EvaluatedTranche>
	multiplicateur: EvaluatedNode<NodeKind, number>
	assiette: EvaluatedNode<NodeKind, number>
}

type Props = EvaluatedNode<'barème', number> & {
	explanation: BaremeExplanation
}
export default function Barème({ nodeValue, explanation, unit }: Props) {
	return (
		<Mecanism name="barème" value={nodeValue} unit={unit}>
			<StyledComponent>
				<ul className="properties">
					<BarèmeAttributes explanation={explanation} />
					<TrancheTable
						tranches={explanation.tranches}
						multiplicateur={explanation.multiplicateur}
					/>
					{/* nous avons remarqué que la notion de taux moyen pour un barème à 2 tranches est moins pertinent pour les règles de calcul des indépendants. Règle empirique à faire évoluer ! */}
					{nodeValue != undefined && explanation.tranches.length > 2 && (
						<>
							<b>Taux moyen : </b>
							<NodeValueLeaf
								data={(100 * nodeValue) / (explanation.assiette.nodeValue ?? 1)}
								unit={parseUnit('%')}
							/>
						</>
					)}
				</ul>
			</StyledComponent>
		</Mecanism>
	)
}

export const BarèmeAttributes = ({
	explanation,
}: Pick<Props, 'explanation'>) => {
	const multiplicateur = explanation.multiplicateur
	return (
		<>
			<li key="assiette">
				<span className="key">Assiette : </span>
				<span className="value">
					<Explanation node={explanation.assiette} />
				</span>
			</li>
			{multiplicateur && !multiplicateur.isDefault && (
				<li key="multiplicateur">
					<span className="key">Multiplicateur : </span>
					<span className="value">
						<Explanation node={multiplicateur} />
					</span>
				</li>
			)}
		</>
	)
}

type TrancheTableProps = {
	tranches: Array<EvaluatedTranche>
	multiplicateur: EvaluatedNode
}
export const TrancheTable = ({
	tranches,
	multiplicateur,
}: TrancheTableProps) => {
	const activeTranche = tranches.find(({ isActive }) => isActive)
	if (!tranches.length) {
		return null
	}
	return (
		<table className="tranches">
			<thead>
				<tr>
					<th>Plafonds des tranches</th>
					{'taux' in tranches[0] && <th>Taux</th>}
					{('montant' in tranches[0] ||
						activeTranche?.nodeValue != undefined) && <th>Montant</th>}
				</tr>
			</thead>
			<tbody>
				{tranches.map((tranche, i) => (
					<Tranche key={i} tranche={tranche} multiplicateur={multiplicateur} />
				))}
			</tbody>
		</table>
	)
}

type TrancheProps = {
	tranche: EvaluatedTranche
	multiplicateur: EvaluatedNode
}
const Tranche = ({ tranche, multiplicateur }: TrancheProps) => {
	const isHighlighted = tranche.isActive
	return (
		<tr className={`tranche ${isHighlighted ? 'activated' : ''}`}>
			<td key="tranche">
				{tranche.plafond.nodeValue === Infinity ?
					'Au-delà du dernier plafond'
				:	<>
						Inférieur à <Explanation node={tranche.plafond} />
						{multiplicateur && !multiplicateur.isDefault && (
							<>
								{' × '}
								<Explanation node={multiplicateur} />
							</>
						)}
					</>
				}
			</td>
			{'taux' in tranche && (
				<td key="taux">
					<Explanation node={tranche.taux} />
				</td>
			)}
			{(tranche.nodeValue != undefined || 'montant' in tranche) && (
				<td key="value">
					{'montant' in tranche ?
						<Explanation node={tranche.montant} />
					:	<NodeValueLeaf data={tranche.nodeValue} unit={tranche.unit} />}
				</td>
			)}
		</tr>
	)
}

export const StyledComponent = styled.div`
	table {
		margin: 1em 0;
		width: 100%;
		text-align: left;
		font-weight: 400;
	}
	table td {
		padding: 0.1em 0.4em;
	}
	table th {
		font-weight: 600;
	}
	table th:first-letter {
		text-transform: uppercase;
	}
	.tranche:nth-child(2n) {
		background: var(--lightestColor);
	}
	.tranche.activated {
		background: var(--lighterColor);
		font-weight: bold;
	}
`
