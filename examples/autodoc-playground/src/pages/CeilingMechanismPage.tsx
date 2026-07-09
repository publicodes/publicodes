import { ChainedValue } from '@publicodes/autodoc-react'
import { ceilingMechanismStub } from '@publicodes/autodoc-core/examples'

export function CeilingMechanismPage() {
	return (
		<>
			<h1>CeilingMechanism</h1>
			<p>Plafonné à : 10k€</p>
			<div className="demo-block">
				<ChainedValue node={ceilingMechanismStub} />
			</div>
		</>
	)
}
