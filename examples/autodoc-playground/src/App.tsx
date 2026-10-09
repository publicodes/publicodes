import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type { TraceValue } from '@publicodes/autodoc-core'
import { useState } from 'react'
import autoAst from './fixtures/auto-entrepreneur.autodoc.json'
import tjmAst from './fixtures/simple-TJM.autodoc.json'
import autoRules, {
	outputs as autoOutputs,
	parameters as autoParameters,
} from '../../../packages/compiler/examples/auto-entrepreneur/model.publicodes.js'
import tjmRules, {
	outputs as tjmOutputs,
	parameters as tjmParameters,
} from '../../../packages/compiler/examples/simple-TJM/model.publicodes.js'
import { DocumentationPage, type DocumentationPageProps } from './pages/DocumentationPage'

const autoContext: Record<string, TraceValue> = {
	"entreprise . chiffre d'affaires . BIC": 10000,
	"entreprise . chiffre d'affaires . service BIC": 5000,
	"entreprise . chiffre d'affaires . service BNC": 0,
	"entreprise . chiffre d'affaires . vente restauration hébergement": 0,
	'entreprise . activité . nature': 'libérale',
	date: new Date('2024-06-01'),
	'dirigeant . auto-entrepreneur . Cipav . adhérent': false,
}

const tjmContext: Record<string, TraceValue> = {
	"chiffre d'affaires . nombre de jour": 5,
}

const MODELS: Record<string, DocumentationPageProps> = {
	'auto-entrepreneur': {
		title: 'auto-entrepreneur',
		ast: autoAst as PublicodeAST,
		outputs: autoOutputs,
		parameters: autoParameters,
		start: 'dirigeant . auto-entrepreneur . revenu net',
		context: autoContext,
		...(() => {
			const evaluation = autoRules[
				'dirigeant . auto-entrepreneur . revenu net'
			].evaluate(autoContext, { trace: true })
			return {
				trace: evaluation.trace,
				usedParameters: evaluation.needed,
				missing: evaluation.missing,
				evaluatedRule: 'dirigeant . auto-entrepreneur . revenu net',
			}
		})(),
	},
	'simple-TJM': {
		title: 'simple TJM',
		ast: tjmAst as PublicodeAST,
		outputs: tjmOutputs,
		parameters: tjmParameters,
		start: 'exemples . CA élevé',
		context: tjmContext,
		...(() => {
			const evaluation = tjmRules['exemples . CA élevé'].evaluate(tjmContext, {
				trace: true,
			})
			return {
				trace: evaluation.trace,
				usedParameters: evaluation.needed,
				missing: evaluation.missing,
				evaluatedRule: 'dirigeant . auto-entrepreneur . revenu net',
			}
		})(),
	},
}

export function App() {
	const [model, setModel] = useState<keyof typeof MODELS>('auto-entrepreneur')

	return (
		<main>
			<nav className="doc-models">
				{Object.keys(MODELS).map((name) => (
					<button
						key={name}
						type="button"
						className={name === model ? 'on' : ''}
						onClick={() => setModel(name)}
					>
						{name}
					</button>
				))}
			</nav>
			<DocumentationPage key={model} {...MODELS[model]} />
		</main>
	)
}
