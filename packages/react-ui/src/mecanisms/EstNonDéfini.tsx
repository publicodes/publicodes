import { EvaluatedNode } from 'publicodes'
import DefaultInlineMecanism from './common/DefaultInlineMecanism'

export default function MecanismEstNonDéfini(
	node: EvaluatedNode<'est non défini'>,
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
