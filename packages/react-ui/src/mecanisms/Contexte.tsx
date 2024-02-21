import { EvaluatedNode } from 'publicodes'
import { Fragment } from 'react'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { EngineContext } from '../contexts'
import { useEngine } from '../hooks'
import { Mecanism } from './common/Mecanism'

export default function Contexte({ explanation }: EvaluatedNode<'contexte'>) {
	const engine = useEngine()
	const contexteEngine =
		explanation.subEngineId ?
			engine.subEngines[explanation.subEngineId]
		:	engine
	return (
		<>
			<Mecanism name="contexte">
				<p>
					Ce calcul est effectué en changeant les valeurs des règles suivantes :
				</p>
				<StyledDL>
					{explanation.contexte.map(([origin, newValue]) => (
						<Fragment key={origin.dottedName as string}>
							<dt>
								<RuleLinkWithContext dottedName={origin.dottedName as string} />
							</dt>
							<dd>
								<span aria-hidden> = </span>
								<Explanation node={newValue} />
							</dd>
						</Fragment>
					))}
				</StyledDL>
			</Mecanism>
			<EngineContext.Provider value={contexteEngine}>
				<Explanation node={explanation.valeur} />
			</EngineContext.Provider>
		</>
	)
}

const StyledDL = styled.dl`
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 0.6rem;
	line-height: 1.75;
	dd {
		margin: 0;
		display: flex;
		gap: 0.5rem;
	}
	@media (max-width: 600px) {
		grid-template-columns: auto;
		line-height: initial;
		dd {
			justify-content: flex-end;
			margin-bottom: 0.5rem;
		}
	}
`
