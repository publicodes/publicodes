import { ChainedValue } from '@publicodes/autodoc-react'
import { applicableIfMechanismStub } from '@publicodes/autodoc-core/examples'

export function ApplicableIfMechanismPage() {
	return (
		<>
			<h1>ApplicableIfMechanism</h1>
			<p>Est applicable si une condition est vraie</p>
			<div className="demo-block">
				<ChainedValue node={applicableIfMechanismStub} />
			</div>
		</>
	)
}
