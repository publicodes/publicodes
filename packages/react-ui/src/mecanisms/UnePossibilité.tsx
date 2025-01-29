import { EvaluatedNode } from 'publicodes'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { Mecanism } from './common/Mecanism'
import { StyledNodeValuePointer } from './common/NodeValueLeaf'

export default function UnePossibilité(node: EvaluatedNode<'une possibilité'>) {
	return (
		<Mecanism
			name="une possibilité"
			value={node.nodeValue}
			docUrl="http://publi.codes/docs/manuel/une-possibilit%C3%A9"
		>
			<ul>
				{node.explanation.map((possibility, i) => {
					const notApplicable =
						(possibility.notApplicable as EvaluatedNode)?.nodeValue === true
					return (
						<li key={i}>
							{possibility.nodeKind === 'reference' ?
								<>
									<RuleLinkWithContext
										dottedName={possibility.dottedName as string}
									>
										<code
											style={{
												textDecoration: notApplicable ? 'line-through' : '',
											}}
										>
											{possibility.publicodesValue}
										</code>
									</RuleLinkWithContext>
									{notApplicable && (
										<StyledNodeValuePointer>
											Non Applicable
										</StyledNodeValuePointer>
									)}
								</>
							: (
								possibility.nodeKind === 'constant' &&
								possibility.type === 'string'
							) ?
								<code>{possibility.publicodesValue}</code>
							:	<Explanation node={possibility} />}
						</li>
					)
				})}
			</ul>
		</Mecanism>
	)
}
