import { ASTNode, EvaluatedNode } from 'publicodes'
import { useState } from 'react'
import Explanation from '../Explanation'
import { useEngine } from '../hooks'

export default function Replacement(node: EvaluatedNode<'variations'>) {
	const engine = useEngine()
	const sourceMaps = node.sourceMap as {
		mecanismName: 'replacement'
		args: {
			originalNode: EvaluatedNode<'reference'>
			applicableReplacements: Array<ASTNode<'replacementRule'>>
		}
	}
	const originalNode = sourceMaps.args.originalNode
	const applicableReplacement = sourceMaps.args.applicableReplacements.find(
		({ definitionRule }) =>
			engine.evaluate(definitionRule).nodeValue === node.nodeValue,
	)

	if (!applicableReplacement || applicableReplacement.replaceByNonApplicable) {
		originalNode.nodeValue = node.nodeValue
		return <Explanation node={originalNode} />
	}
	const [showOriginal, setShowOriginal] = useState(false)
	return (
		<>
			<span
				style={{
					display: 'inline-flex',
					maxWidth: '100%',
					alignItems: 'baseline',
				}}
			>
				<button
					style={{
						marginRight: '0.4rem',
					}}
					onClick={() => setShowOriginal(!showOriginal)}
					type="button"
					aria-expanded="true"
					aria-controls="id_about_menu"
					title={
						showOriginal ?
							'Voir la valeur remplacée'
						:	'Cacher la valeur remplacée'
					}
				>
					🔄
				</button>{' '}
				<span
					style={{
						display: 'flex',
						flexDirection: 'column',
						flex: '1 1 .0%',
					}}
				>
					{showOriginal && (
						<span
							style={{
								opacity: '0.6',
								textDecoration: 'line-through',
							}}
						>
							<Explanation node={originalNode} />
						</span>
					)}
					<Explanation node={applicableReplacement.definitionRule} />
				</span>
			</span>
		</>
	)
}
