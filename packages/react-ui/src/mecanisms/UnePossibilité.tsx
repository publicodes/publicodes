import { EvaluatedNode } from 'publicodes'
import Explanation from '../Explanation'
import { Mecanism } from './common/Mecanism'

export default function UnePossibilitéMecanism({
	explanation,
}: EvaluatedNode<'une possibilité'>) {
	return (
		<Mecanism name="une possibilité parmi" value={undefined}>
			<ul>
				{explanation.map((node, i) => (
					<li key={i}>
						<Explanation node={node} />
					</li>
				))}
			</ul>
		</Mecanism>
	)
}
