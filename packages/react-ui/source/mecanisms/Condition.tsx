import { EvaluatedNode } from 'publicodes'
import type { VariationNode } from 'publicodes/dist/mecanisms/condition'
import Explanation from '../Explanation'
import { Mecanism } from './common'

export default function Condition({
	nodeValue,
	explanation,
	unit,
}: VariationNode & EvaluatedNode) {
	return (
		<Mecanism name="condition" unit={unit} value={nodeValue}>
			<ul>
				<li>
					<strong>Si</strong> : <Explanation node={explanation.si} />
				</li>
				<li>
					<strong>Alors</strong> : <Explanation node={explanation.alors} />
				</li>
				<li>
					<strong>Sinon</strong> : <Explanation node={explanation.sinon} />
				</li>
			</ul>
		</Mecanism>
	)
}
