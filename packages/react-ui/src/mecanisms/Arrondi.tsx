import { EvaluatedNode } from 'publicodes'
import Explanation from '../Explanation'
import { InfixMecanism } from './common/InfixMecanism'

export default function MecanismArrondi(node: EvaluatedNode<'arrondi'>) {
	return (
		<InfixMecanism value={node}>
			<p>
				<strong>Arrondi : </strong>
				<Explanation node={node.explanation.arrondi} />
			</p>
		</InfixMecanism>
	)
}
