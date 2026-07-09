import { ChainedValue } from '@publicodes/autodoc-react'
import { notDefinedMechanismStub } from '@publicodes/autodoc-core/examples'

export function NotDefinedMechanismPage() {
	return (
		<>
			<h1>NotDefined</h1>
			<p>Un paramètre non défini</p>
			<div className="demo-block">
				<ChainedValue node={notDefinedMechanismStub} />
			</div>
		</>
	)
}
