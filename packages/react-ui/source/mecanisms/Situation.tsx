import { usePromise } from '@publicodes/worker-react'
import Engine, { RuleNode } from 'publicodes'
import Explanation from '../Explanation'
import { executeAction, getSubEngineOrEngine } from '../actions'
import { useEngine, useSubEngineId } from '../hooks/useEngine'
import { InfixMecanism } from './common'

export const evaluateWithSubEngine = (
	baseEngine: Engine,
	{
		evaluate,
		subEngineId,
	}: { evaluate: Parameters<Engine['evaluate']>[0]; subEngineId?: number }
) => {
	const engine = getSubEngineOrEngine(baseEngine, subEngineId)

	return engine.evaluate(evaluate)
}

export default function MecanismSituation({ sourceMap }) {
	const engine = useEngine()
	const subEngineId = useSubEngineId()

	const evaluate = sourceMap?.args['dans la situation']

	const situationValeur = usePromise(
		() =>
			executeAction(engine, 'evaluateWithSubEngine', {
				evaluate,
				subEngineId,
			}),
		[engine, evaluate, subEngineId]
	)

	if (sourceMap === undefined) {
		return null
	}

	return situationValeur?.nodeValue !== undefined ? (
		<InfixMecanism prefixed value={sourceMap.args['valeur']}>
			<p>
				<strong>Valeur renseignée dans la simulation : </strong>
				<Explanation node={(situationValeur as RuleNode).explanation.valeur} />
			</p>
		</InfixMecanism>
	) : (
		<Explanation node={sourceMap.args['valeur']} />
	)
}
