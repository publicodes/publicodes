import Engine, { formatValue, utils } from 'publicodes'
import yaml from 'yaml'
const { encodeRuleName } = utils

type Props = { dottedName: string; engine: Engine }

export default function RuleSource({ engine, dottedName }: Props) {
	const href = useRuleSource(engine, dottedName)

	if (window.location.host === 'publi.codes') {
		return null
	}

	return (
		<p style={{ textAlign: 'right' }}>
			<a target="_blank" href={href}>
				✍️ Voir la règle dans le bac à sable Publicodes
			</a>
		</p>
	)
}

export const useRuleSource = (engine: Engine, dottedName: string) => {
	// Array.from is a workaround for https://github.com/facebook/docusaurus/issues/7606#issuecomment-1330452598
	const dependencies = Array.from(
		engine.context.referencesMaps.referencesIn.get(dottedName) ?? []
	)

	const rule = engine.evaluateNode(engine.getRule(dottedName))

	// When we import a rule in the Publicodes Studio, we need to provide a
	// simplified definition of its dependencies to avoid undefined references.
	const dependenciesValues = Object.fromEntries(
		dependencies
			.filter((name) => name !== dottedName && !name.endsWith(' . $SITUATION'))
			.map((dottedName) => [
				dottedName,
				formatValueForStudio(
					engine.evaluateNode(engine.context.parsedRules[dottedName])
				),
			])
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
					Object.entries(rule.rawNode).filter(([key]) => key !== 'nom')
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
