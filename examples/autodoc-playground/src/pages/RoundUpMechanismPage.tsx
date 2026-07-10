import { ChainedValue } from '@publicodes/autodoc-react'
import { roundUpMechanismStub } from '@publicodes/autodoc-core/examples'

export function RoundUpMechanismPage() {
	return (
		<>
			<h1>RoundUpMechanism</h1>
			<p>Arrondi au supérieur à 2 décimales</p>
			<div className="demo-block">
				<ChainedValue node={roundUpMechanismStub} />
			</div>
		</>
	)
}
