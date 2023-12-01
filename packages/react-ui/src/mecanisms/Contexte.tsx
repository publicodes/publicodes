import { EvaluatedNode } from 'publicodes'
import { ContextNode } from 'publicodes/src/mecanisms/contexte'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { EngineContext } from '../contexts'
import { useEngine } from '../hooks'
import { Mecanism } from './common'

export default function Contexte({ explanation }: ContextNode & EvaluatedNode) {
	const engine = useEngine()
	const contexteEngine = explanation.subEngineId
		? engine.subEngines[explanation.subEngineId]
		: engine
	return (
		<>
			<Mecanism name="contexte">
				<ul>
					{explanation.contexte.map(([origin, newValue]) => (
						<li key={origin.dottedName}>
							<RuleLinkWithContext dottedName={origin.dottedName as string} /> ={' '}
							<Explanation node={newValue} />
						</li>
					))}
				</ul>
				<small>
					Ces valeurs remplacent celles d'origine dans le calcul qui suit
				</small>
			</Mecanism>
			<EngineContext.Provider value={contexteEngine}>
				<Explanation node={explanation.node} />
			</EngineContext.Provider>
		</>
	)
}
