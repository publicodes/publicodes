import { EvaluatedNode } from 'publicodes'
import DefaultInlineMecanism from './common/DefaultInlineMecanism'

export default function MecanismDurée(node: EvaluatedNode<'durée'>) {
	return (
		<DefaultInlineMecanism
			{...node}
			sourceMap={{ mecanismName: node.nodeKind, args: node.explanation }}
		/>
	)
}
