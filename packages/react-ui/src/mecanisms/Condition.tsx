import { EvaluatedNode } from 'publicodes'
import DefaultInlineMecanism from './common/DefaultInlineMecanism'

export default function MecanismCondition(node: EvaluatedNode<'condition'>) {
	return (
		<DefaultInlineMecanism
			{...node}
			sourceMap={{ mecanismName: node.nodeKind, args: node.explanation }}
		/>
	)
}
