import { EvaluatedNode } from 'publicodes'
import type { VariationNode } from 'publicodes/src/mecanisms/variations'
import { useState } from 'react'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import writtenNumbers from '../writtenNumbers'
import { CapitalizeFirstLetter, InlineMecanismName, Mecanism } from './common'

export default function Variations({
	nodeValue,
	explanation,
	unit,
}: VariationNode & EvaluatedNode) {
	const [expandedVariation, toggleVariation] = useState<undefined | number>(
		undefined,
	)
	return (
		<StyledComponent>
			<Mecanism
				name="variations"
				displayName={false}
				unit={unit}
				value={nodeValue}
			>
				<>
					<CapitalizeFirstLetter>
						{writtenNumbers[explanation.length]}{' '}
						<InlineMecanismName name="variations" /> possibles :
					</CapitalizeFirstLetter>
					<ol>
						{explanation.map(({ condition, consequence }, i: number) => {
							const satisfied =
								'nodeValue' in condition &&
								condition.nodeValue !== false &&
								condition.nodeValue !== null
							return (
								<li
									key={i}
									style={{
										transition: 'all 0.2s',
										opacity:
											(
												expandedVariation === i ||
												satisfied ||
												nodeValue == undefined
											) ?
												1
											:	0.8,
									}}
								>
									{!satisfied && (
										<>
											<em>non applicable </em>
											{expandedVariation !== i ?
												<button
													className="ui__ link-button"
													onClick={() => toggleVariation(i)}
												>
													détails ▶️
												</button>
											:	<button
													className="ui__ link-button"
													onClick={() => toggleVariation(undefined)}
												>
													replier 🔽
												</button>
											}
										</>
									)}
									{(expandedVariation === i || satisfied) && (
										<div style={{ margin: '1rem 0' }}>
											{!condition.isDefault && (
												<div
													style={{
														display: 'flex',
														flexWrap: 'wrap',
														alignItems: 'baseline',
														marginBottom: '0.4rem',
													}}
												>
													Si :&nbsp;
													<Explanation node={condition} />
												</div>
											)}
											<div
												style={{
													display: 'flex',
													width: 'fit-content',
													flexWrap: 'wrap',
													alignItems: 'baseline',
												}}
											>
												<span
													className={`consequenceType ${
														satisfied ? 'satisfied' : ''
													}`}
												>
													{!condition.isDefault ? 'Alors' : 'Sinon'} :&nbsp;
												</span>
												<span
													className={`consequenceContent ${
														satisfied ? 'satisfied' : ''
													}`}
												>
													{consequence && <Explanation node={consequence} />}
												</span>
											</div>
										</div>
									)}
								</li>
							)
						})}
					</ol>
				</>
			</Mecanism>
		</StyledComponent>
	)
}

const StyledComponent = styled.div`
	.mecanism > ol {
		margin-left: 1rem;
		margin-top: 1rem;
	}
	.mecanism > ol > li {
		margin-bottom: 0.3em;
	}
	.mecanism > ol > li span.consequenceType {
		margin: 0 0.6em 0.6em 0;
	}

	.mecanism > ol > li span.consequenceType.satisfied {
		background: yellow;
	}
`
