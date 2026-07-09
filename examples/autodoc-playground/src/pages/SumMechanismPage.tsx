import { ChainedValue } from '@publicodes/autodoc-react'
import { sumMechanismStub } from '@publicodes/autodoc-core/examples'

export function SumMechanismPage() {
	return (
		<>
			<h1>SumMechanism</h1>
			<p>Une somme : <code>revenus . salaire + revenus . indépendant</code></p>
			<div className="demo-block">
				<ChainedValue node={sumMechanismStub} />
			</div>
		</>
	)
}
