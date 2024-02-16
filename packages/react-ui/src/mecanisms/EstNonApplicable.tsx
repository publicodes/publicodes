import { EvaluatedNode } from 'publicodes'
import DefaultInlineMecanism from './common/DefaultInlineMecanism'

export default function MecanismEstNonApplicable(
	node: EvaluatedNode<'est non applicable'>,
) {
	return (
		<DefaultInlineMecanism
			{...node}
			sourceMap={{
				mecanismName: node.nodeKind,
				args: { valeur: node.explanation },
			}}
		/>
	)
}
