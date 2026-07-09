import { ChainedValue } from '@publicodes/autodoc-react'
import { allOfMechanismStub } from '@publicodes/autodoc-core/examples'

export function AllOfMechanismPage() {
	return (
		<>
			<h1>AllOfMechanism</h1>
			<p>Toutes ces conditions : <code>A ∧ B</code></p>
			<div className="demo-block">
				<ChainedValue node={allOfMechanismStub} />
			</div>
		</>
	)
}
