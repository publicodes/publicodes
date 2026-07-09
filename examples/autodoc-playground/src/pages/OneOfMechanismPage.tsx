import { ChainedValue } from '@publicodes/autodoc-react'
import { oneOfMechanismStub } from '@publicodes/autodoc-core/examples'

export function OneOfMechanismPage() {
	return (
		<>
			<h1>OneOfMechanism</h1>
			<p>Un choix parmi plusieurs valeurs : <code>parmi : a, b</code></p>
			<div className="demo-block">
				<ChainedValue node={oneOfMechanismStub} />
			</div>
		</>
	)
}
