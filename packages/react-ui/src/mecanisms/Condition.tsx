import DefaultInlineMecanism from './DefaultInlineMecanism'

export default function MecanismCondition(node) {
	return (
		<DefaultInlineMecanism
			{...node}
			sourceMap={{ mecanismName: node.nodeKind, args: node.explanation }}
		/>
	)
}
