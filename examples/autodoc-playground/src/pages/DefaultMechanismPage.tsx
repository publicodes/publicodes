import { ChainedValue } from '@publicodes/autodoc-react'
import { defaultMechanismStub } from '@publicodes/autodoc-core/examples'

export function DefaultMechanismPage() {
	return (
		<>
			<h1>DefaultMechanism</h1>
			<p>Une valeur par défaut : 1000€</p>
			<div className="demo-block">
				<ChainedValue node={defaultMechanismStub} />
			</div>
		</>
	)
}
