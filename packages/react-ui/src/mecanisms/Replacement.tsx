import { EvaluatedNode } from 'publicodes'
import { VariationNode } from 'publicodes/src/mecanisms/variations'
import Explanation from '../Explanation'
import { useEngine } from '../hooks'

export default function Replacement(node: VariationNode & EvaluatedNode) {
	const engine = useEngine()

	console.log(node.sourceMap)
	const originalNode = node.sourceMap?.args.originalNode
	const applicableReplacement =
		node.sourceMap?.args.applicableReplacements.find(
			({ definitionRule }) =>
				engine.evaluate(definitionRule).nodeValue === node.nodeValue,
		)
	if (!applicableReplacement || applicableReplacement.replaceByNonApplicable) {
		originalNode.nodeValue = node.nodeValue
		return <Explanation node={originalNode} />
	}
	return <Explanation node={applicableReplacement.definitionRule} />
}
