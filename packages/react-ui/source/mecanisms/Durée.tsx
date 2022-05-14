import DefaultInlineMecanism from './DefaultInlineMecanism'

export default function MecanismDurée(node) {
	return (
		<DefaultInlineMecanism
			{...node}
			sourceMap={{ mecanismName: node.nodeKind, args: node.explanation }}
		/>
	)
}
