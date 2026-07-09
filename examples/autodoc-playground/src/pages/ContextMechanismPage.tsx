import { ChainedValue } from '@publicodes/autodoc-react'
import { contextMechanismStub } from '@publicodes/autodoc-core/examples'

export function ContextMechanismPage() {
	return (
		<>
			<h1>ContextMechanism</h1>
			<p>Dans un contexte : <code>département = "75"</code></p>
			<div className="demo-block">
				<ChainedValue node={contextMechanismStub} />
			</div>
		</>
	)
}
