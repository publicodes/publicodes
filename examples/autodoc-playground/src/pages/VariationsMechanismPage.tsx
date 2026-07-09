import { ChainedValue } from '@publicodes/autodoc-react'
import { variationsMechanismStub } from '@publicodes/autodoc-core/examples'

export function VariationsMechanismPage() {
	return (
		<>
			<h1>VariationsMechanism</h1>
			<p>Un barème progressif : ≤ 10k → 0%, ≤ 25k → 11%, sinon → 30%</p>
			<div className="demo-block">
				<ChainedValue node={variationsMechanismStub} />
			</div>
		</>
	)
}
