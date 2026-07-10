import { PublicodeAST } from '@publicodes/autodoc-core/ast'
import {
	ChainedValue,
	AutodocButtonNavigationContext,
	AutodocRuleContext,
} from '@publicodes/autodoc-react'
import tjmAutodoc from '../../../../packages/compiler/examples/simple-TJM/model.publicodes.json'
import tjmRules from '../../../../packages/compiler/examples/simple-TJM/model.publicodes.js'
import { useState } from 'react'

let doc = tjmAutodoc as PublicodeAST
let trace = tjmRules['exemples . CA élevé'].evaluate(
	{
		"chiffre d'affaires . nombre de jour": 5,
	},
	{ trace: true },
).trace

export function SimpleTJMExamplePage() {
	const [contextStackId, setContextStackId] = useState('')

	return (
		<AutodocRuleContext.Provider value={{ doc }}>
			<h1>Exemple : simple TJM</h1>
			{contextStackId !== '' ?
				<div>
					Evaluation dans le contexte : <code>{contextStackId}</code>
					<button onClick={() => setContextStackId('')}>Supprimer</button>
				</div>
			:	<></>}
			{Object.entries(doc).map(([rule, value]) => (
				<div className="demo-block">
					<strong>{rule}</strong>

					<AutodocButtonNavigationContext.Provider
						value={{
							contextStackId,
							rule: rule,
							onNavigate: (ruleName, contextStackId) => {
								const el = document.getElementById(`rule-${ruleName}`)
								if (el) {
									el.scrollIntoView({ behavior: 'smooth' })
								}
								setContextStackId(contextStackId)
							},
						}}
					>
						<ChainedValue key={rule} node={value} trace={trace} />
					</AutodocButtonNavigationContext.Provider>
				</div>
			))}
		</AutodocRuleContext.Provider>
	)
}
