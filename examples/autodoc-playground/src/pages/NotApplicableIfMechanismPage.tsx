import { ChainedValue } from '@publicodes/autodoc-react'
import { notApplicableIfMechanismStub } from '@publicodes/autodoc-core/examples'

export function NotApplicableIfMechanismPage() {
	return (
		<>
			<h1>NotApplicableIfMechanism</h1>
			<p>N'est pas applicable si une condition est vraie</p>
			<div className="demo-block">
				<ChainedValue node={notApplicableIfMechanismStub} />
			</div>
		</>
	)
}
