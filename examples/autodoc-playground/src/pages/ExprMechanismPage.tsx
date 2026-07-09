import { ChainedValue } from '@publicodes/autodoc-react'
import {
	exprMechanismStub,
	parensExpressionStub,
} from '@publicodes/autodoc-core/examples'

export function ExprMechanismPage() {
	return (
		<>
			<h1>ExprMechanism</h1>

			<h2>Sans parenthèses</h2>
			<p><code>revenu × 0.3</code></p>
			<div className="demo-block">
				<ChainedValue node={exprMechanismStub} />
			</div>

			<h2>Avec parenthèses</h2>
			<p><code>revenu × (taux + 1)</code></p>
			<div className="demo-block">
				<ChainedValue node={parensExpressionStub} />
			</div>
		</>
	)
}
