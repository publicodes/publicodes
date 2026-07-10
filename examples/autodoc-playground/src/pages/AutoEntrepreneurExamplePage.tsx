import { PublicodeAST } from '@publicodes/autodoc-core/ast'
import {
	AutodocButtonNavigationContext,
	AutodocRuleContext,
	ChainedValue,
} from '@publicodes/autodoc-react'
import tjmAutodoc from '../../../../packages/compiler/examples/auto-entrepreneur/model.publicodes.json'
import tjmRules from '../../../../packages/compiler/examples/auto-entrepreneur/model.publicodes.js'
import { useState } from 'react'

let doc = tjmAutodoc as PublicodeAST
let trace = tjmRules['dirigeant . auto-entrepreneur . revenu net'].evaluate(
	{
		"entreprise . chiffre d'affaires . BIC": 10000,
	},
	{ trace: true },
).trace

const reference = Object.keys(doc)[0]

export function AutoEntrepeneurExamplePage() {
	const [contextStackId, setContextStackId] = useState('')

	return (
		<AutodocRuleContext.Provider value={{ doc, currentRule: reference }}>
			<AutodocButtonNavigationContext.Provider
				value={{
					currentContextStackId: contextStackId,
					currentRule: reference,
					onNavigate: (ruleName, contextStackId) => {
						const el = document.getElementById(`rule-${ruleName}`)
						if (el) {
							el.scrollIntoView({ behavior: 'smooth' })
						}
						setContextStackId(contextStackId)
					},
				}}
			>
				<h1>Exemple : auto-entrepreneur</h1>
				{contextStackId !== '' ?
					<div>{contextStackId}</div>
				:	<></>}
				{Object.entries(doc).map(([key, value]) => (
					<div className="demo-block" id={`rule-${key}`}>
						<strong>{key}</strong>
						<ChainedValue key={key} node={value} trace={trace} />
					</div>
				))}
			</AutodocButtonNavigationContext.Provider>
		</AutodocRuleContext.Provider>
	)
}
