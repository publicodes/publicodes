import { ChainedValue } from '@publicodes/autodoc-react'
import { isApplicableMechanismStub } from '@publicodes/autodoc-core/examples'

export function IsApplicableMechanismPage() {
	return (
		<>
			<h1>IsApplicableMechanism</h1>
			<p>Le mécanisme <code>est applicable</code></p>
			<div className="demo-block">
				<ChainedValue node={isApplicableMechanismStub} />
			</div>
		</>
	)
}
