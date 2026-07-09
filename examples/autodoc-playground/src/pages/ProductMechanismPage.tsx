import { ChainedValue } from '@publicodes/autodoc-react'
import { productMechanismStub } from '@publicodes/autodoc-core/examples'

export function ProductMechanismPage() {
	return (
		<>
			<h1>ProductMechanism</h1>
			<p>Un produit : <code>assiette × taux</code></p>
			<div className="demo-block">
				<ChainedValue node={productMechanismStub} />
			</div>
		</>
	)
}
