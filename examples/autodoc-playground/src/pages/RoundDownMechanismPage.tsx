import { ChainedValue } from '@publicodes/autodoc-react'
import { roundDownMechanismStub } from '@publicodes/autodoc-core/examples'

export function RoundDownMechanismPage() {
	return (
		<>
			<h1>RoundDownMechanism</h1>
			<p>Arrondi à l'inférieur à l'unité</p>
			<div className="demo-block">
				<ChainedValue node={roundDownMechanismStub} />
			</div>
		</>
	)
}
