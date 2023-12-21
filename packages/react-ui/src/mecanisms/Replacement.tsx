import { ASTNode, EvaluatedNode } from 'publicodes'
import { useId, useState } from 'react'
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
	const id = useId()
	return (
		<>
			<span
				style={{
					display: 'inline-flex',
					maxWidth: '100%',
				}}
			>
				<span
					style={{
						display: 'flex',
						flexDirection: 'column',
						flex: '1 1 0%',
					}}
				>
					{showOriginal && (
						<span
							id={id}
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
				<div
					style={{
						marginLeft: '0.4rem',
					}}
				>
					<button
						onClick={() => setShowOriginal(!showOriginal)}
						type="button"
						className="publicodes_btn-small"
						aria-expanded={showOriginal}
						aria-controls={id}
						title={
							showOriginal ?
								'Cacher la valeur d’origine'
							:	'Voir la valeur d’origine'
						}
					>
						🔄
					</button>
				</div>
			</span>
		</>
	)
}
