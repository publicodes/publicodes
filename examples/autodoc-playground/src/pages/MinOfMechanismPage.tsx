import { ChainedValue } from '@publicodes/autodoc-react'
import { minOfMechanismStub } from '@publicodes/autodoc-core/examples'

export function MinOfMechanismPage() {
	return (
		<>
			<h1>MinOfMechanism</h1>
			<p>Le minimum de plusieurs valeurs</p>
			<div className="demo-block">
				<ChainedValue node={minOfMechanismStub} />
			</div>
		</>
	)
}
