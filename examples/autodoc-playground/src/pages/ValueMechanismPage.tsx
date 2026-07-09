import { ChainedValue } from '@publicodes/autodoc-react'
import { valueMechanismStub } from '@publicodes/autodoc-core/examples'

export function ValueMechanismPage() {
	return (
		<>
			<h1>ValueMechanism</h1>
			<p>Un mécanisme de valeur simple : <code>assiette</code></p>
			<div className="demo-block">
				<ChainedValue node={valueMechanismStub} />
			</div>
		</>
	)
}
