import { ChainedValue } from '@publicodes/autodoc-react'
import { roundNearestMechanismStub } from '@publicodes/autodoc-core/examples'

export function RoundNearestMechanismPage() {
	return (
		<>
			<h1>RoundNearestMechanism</h1>
			<p>Arrondi au plus proche à l'unité</p>
			<div className="demo-block">
				<ChainedValue node={roundNearestMechanismStub} />
			</div>
		</>
	)
}
