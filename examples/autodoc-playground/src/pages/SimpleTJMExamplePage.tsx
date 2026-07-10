import { PublicodeAST } from '@publicodes/autodoc-core/ast'
import {
	ChainedValue,
	AutodocEvaluationTraceProvider,
} from '@publicodes/autodoc-react'
import tjmAutodoc from '../../../../packages/compiler/examples/simple-TJM/model.publicodes.json'
import tjmRules from '../../../../packages/compiler/examples/simple-TJM/model.publicodes.js'

let doc = tjmAutodoc as PublicodeAST
let trace = tjmRules['exemples . CA élevé'].evaluate(
	{
		"chiffre d'affaires . nombre de jour": 5,
	},
	{ trace: true },
).trace

export function SimpleTJMExamplePage() {
	return (
		<AutodocEvaluationTraceProvider>
			<h1>Exemple : simple TJM</h1>
			{Object.entries(doc).map(([key, value]) => (
				<div className="demo-block">
					<strong>{key}</strong>
					<ChainedValue key={key} node={value} trace={trace} />
				</div>
			))}
		</AutodocEvaluationTraceProvider>
	)
}
