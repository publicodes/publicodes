import { ChainedValue } from '@publicodes/autodoc-react'
import { floorMechanismStub } from '@publicodes/autodoc-core/examples'

export function FloorMechanismPage() {
	return (
		<>
			<h1>FloorMechanism</h1>
			<p>Plancher à : 0€</p>
			<div className="demo-block">
				<ChainedValue node={floorMechanismStub} />
			</div>
		</>
	)
}
