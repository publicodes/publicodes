import { PublicodeAST } from '@publicodes/autodoc-core/ast'
import { ChainedValue } from '@publicodes/autodoc-react'
import tjmAutodoc from '../../../../packages/compiler/examples/auto-entrepreneur/model.publicodes.json'
import tjmRules from '../../../../packages/compiler/examples/auto-entrepreneur/model.publicodes.js'

let doc = tjmAutodoc as PublicodeAST
let trace = tjmRules['dirigeant . auto-entrepreneur . revenu net'].evaluate(
	{
		"entreprise . chiffre d'affaires . BIC": 10000,
	},
	{ trace: true },
).trace

export function AutoEntrepeneurExamplePage() {
	return (
		<>
			<h1>Exemple : auto-entrepreneur</h1>
			{Object.entries(doc).map(([key, value]) => (
				<div className="demo-block">
					<strong>{key}</strong>
					<ChainedValue key={key} node={value} trace={trace} />
				</div>
			))}
		</>
	)
}
