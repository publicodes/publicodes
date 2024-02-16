import { ASTNode, EvaluatedNode } from 'publicodes'
import { useContext } from 'react'
import Explanation from '../Explanation'
import { EngineContext } from '../contexts'
import { InfixMecanism } from './common/InfixMecanism'

type Props = {
	sourceMap: {
		args: {
			valeur: EvaluatedNode
			'dans la situation': ASTNode<'reference'>
		}
	}
} & EvaluatedNode<'condition'>
export default function MecanismSituation({ sourceMap }: Props) {
	const engine = useContext(EngineContext)

	const situationValeur = engine?.evaluate(
		sourceMap.args['dans la situation'],
	) as {
		nodeValue: number
		explanation: { valeur: ASTNode }
	}

	return situationValeur?.nodeValue !== undefined ?
			<InfixMecanism prefixed value={sourceMap.args['valeur']}>
				<p>
					<strong>Valeur renseignée dans la simulation : </strong>
					<Explanation node={situationValeur.explanation.valeur} />
				</p>
			</InfixMecanism>
		:	<Explanation node={sourceMap.args['valeur']} />
}
