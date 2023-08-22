import { EvaluatedNode } from 'publicodes'
import { RecalculNode } from 'publicodes/source/mecanisms/recalcul'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { EngineContextProvider, useEngine } from '../hooks/useEngine'
import { Mecanism } from './common'

export default function Recalcul({
	nodeValue,
	explanation,
	unit,
}: RecalculNode & EvaluatedNode) {
	const engine = useEngine()

	return (
		<Mecanism name="recalcul" value={nodeValue} unit={unit}>
			<>
				{explanation.recalculNode && (
					<EngineContextProvider
						value={{ engine, subEngineId: explanation.subEngineId }}
					>
						Recalcul de la valeur de{' '}
						<Explanation node={explanation.recalculNode} /> avec la situation
						suivante :
					</EngineContextProvider>
				)}
				<ul>
					{explanation.amendedSituation.map(([origin, replacement]) => (
						<li key={origin.dottedName}>
							<RuleLinkWithContext dottedName={origin.dottedName as string} /> ={' '}
							<Explanation node={replacement} />
						</li>
					))}
				</ul>
			</>
		</Mecanism>
	)
}
