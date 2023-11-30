import { useContext } from 'react'
import Explanation from '../Explanation'
import { EngineContext } from '../contexts'
import { InfixMecanism } from './common'

export default function MecanismSituation({ sourceMap }) {
	const engine = useContext(EngineContext)
	const situationValeur = engine?.evaluate(sourceMap.args['dans la situation'])
	return situationValeur?.nodeValue !== undefined ? (
		<InfixMecanism prefixed value={sourceMap.args['valeur']}>
			<p>
				<strong>Valeur renseignée dans la simulation : </strong>
				<Explanation node={(situationValeur as any).explanation.valeur} />
			</p>
		</InfixMecanism>
	) : (
		<Explanation node={sourceMap.args['valeur']} />
	)
}
