import { ActionData } from '@publicodes/worker'
import { usePromise } from '@publicodes/worker-react'
import { formatValue, utils } from 'publicodes'
import yaml from 'yaml'
import { executeAction, getSubEngineOrEngine } from '../actions'
import { useEngine, useSubEngineId } from '../hooks/useEngine'

const { encodeRuleName } = utils

type Props = { dottedName: string }

export default function RuleSource({ dottedName }: Props) {
	const engine = useEngine()
	const subEngineId = useSubEngineId()

	const href = usePromise(
		() => executeAction(engine, 'getRuleSource', { dottedName, subEngineId }),
		[engine, dottedName, subEngineId]
	)

	if (typeof window !== 'undefined' && window.location.host === 'publi.codes') {
		return null
	}

	const linkLabel = 'Afficher la règle dans le bac à sable Publicodes'

	return (
		<p style={{ textAlign: 'right' }}>
			<a
				target="_blank"
				href={href}
				aria-label={`${linkLabel}, nouvelle fenêtre`}
			>
				<span aria-hidden>✍️</span> {linkLabel}
			</a>
		</p>
	)
}

export const getRuleSource = (
	{ engine: baseEngine }: ActionData,
	{ dottedName, subEngineId }: { dottedName: string; subEngineId?: number }
) => {
	const engine = getSubEngineOrEngine(baseEngine, subEngineId)

	// Array.from is a workaround for https://github.com/facebook/docusaurus/issues/7606#issuecomment-1330452598
	const dependencies = Array.from(
		engine.context.referencesMaps.referencesIn.get(dottedName) ?? []
	)

	const node = engine.evaluateNode(engine.context.parsedRules[dottedName])

	// When we import a rule in the Publicodes Studio, we need to provide a
	// simplified definition of its dependencies to avoid undefined references.
	const dependenciesValues = Object.fromEntries(
		dependencies
			.filter((name) => name !== dottedName && !name.endsWith(' . $SITUATION'))
			.map((dottedName) => [dottedName, formatValueForStudio(node)])
	)

	const source =
		`
# Ci-dessous la règle d'origine, écrite en publicodes.

# Publicodes est un langage déclaratif développé par l'Urssaf
# en partenariat avec beta.gouv.fr pour encoder les algorithmes d'intérêt public.

# Vous pouvez modifier les valeurs directement dans l'éditeur pour voir les calculs
# s'actualiser en temps réel
` +
		yaml
			.stringify({
				[dottedName]: Object.fromEntries(
					Object.entries(node.rawNode).filter(([key]) => key !== 'nom')
				),
			})
			.replace(`${dottedName}:`, `\n${dottedName}:`) +
		'\n\n# Situation :\n' +
		yaml.stringify(dependenciesValues).split('\n').sort().join('\n')

	// For clarity add a break line before the main rule

	const baseURL = location.hostname === 'localhost' ? '' : 'https://publi.codes'

	return `${baseURL}/studio/${encodeRuleName(
		dottedName
	)}?code=${encodeURIComponent(source)}`
}

// TODO: This formating function should be in the core code. We need to think
// about the different options of the formatting options and our use cases
// (putting a value in the URL #1169, importing a value in the Studio, showing a value
// on screen)
function formatValueForStudio(node: Parameters<typeof formatValue>[0]) {
	const base = formatValue(node)
		.replace(/\s\/\s/g, '/')
		.replace(/(\d)\s(\d)/g, '$1$2')
		.replace(',', '.')
	if (base.match(/^[0-9]/) || base === 'Oui' || base === 'Non') {
		return base.toLowerCase()
	} else if (base === '-') {
		return 'non'
	} else {
		return `'${base}'`
	}
}
