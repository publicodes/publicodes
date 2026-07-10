import { ChainedValue } from '@publicodes/autodoc-react'
import { maxOfMechanismStub } from '@publicodes/autodoc-core/examples'

export function MaxOfMechanismPage() {
	return (
		<>
			<h1>MaxOfMechanism</h1>
			<p>Le maximum de plusieurs valeurs</p>
			<div className="demo-block">
				<ChainedValue node={maxOfMechanismStub} />
			</div>
		</>
	)
}
