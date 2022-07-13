import { RuleNode } from 'publicodes/source'
import { useContext } from 'react'
import { EngineContext } from '../contexts'
import Explanation from '../Explanation'
import { InfixMecanism } from './common'

export default function MecanismSituation({ sourceMap }) {
	const engine = useContext(EngineContext)
	const situationValeur = engine?.evaluate(sourceMap.args['dans la situation'])
	return situationValeur?.nodeValue !== undefined ? (
		<InfixMecanism prefixed value={sourceMap.args['valeur']} dimValue>
			<p>
				<strong>Valeur renseignée dans la simulation : </strong>
				<Explanation node={(situationValeur as RuleNode).explanation.valeur} />
			</p>
		</InfixMecanism>
	) : (
		<Explanation node={sourceMap.args['valeur']} />
	)
}
