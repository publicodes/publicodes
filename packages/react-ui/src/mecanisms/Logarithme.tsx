import { EvaluatedNode } from 'publicodes'
import Explanation from '../Explanation'
import { Mecanism } from './common/Mecanism'

export default function MecanismArrondi(node: EvaluatedNode<'logarithme'>) {
	return (
		<Mecanism name="logarithme" value={node.nodeValue}>
			<Explanation node={node.explanation} />
		</Mecanism>
	)
}
