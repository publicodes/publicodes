import Engine, { formatValue, utils } from 'publicodes'
const { encodeRuleName } = utils

type Props = { dottedName: string; engine: Engine }

export default function RuleSource({ engine, dottedName }: Props) {
	const href = useRuleSource(engine, dottedName)

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
				rel="noreferrer"
			>
				<span aria-hidden>✍️</span> {linkLabel}
			</a>
		</p>
	)
}

export const useRuleSource = (engine: Engine, dottedName: string) => {
	// Array.from is a workaround for https://github.com/facebook/docusaurus/issues/7606#issuecomment-1330452598
	const dependencies = Array.from(
		engine.context.referencesMaps.referencesIn.get(dottedName) ?? [],
	)

	const node = engine.evaluateNode(engine.context.parsedRules[dottedName])

	const rules = {
		[dottedName]: Object.fromEntries(
			Object.entries(node.rawNode).filter(([key]) => key !== 'nom'),
		),
	}

	// When we import a rule in the Publicodes Studio, we need to provide a
	// simplified definition of its dependencies to avoid undefined references.
	const situation = Object.fromEntries(
		dependencies
			.filter((name) => name !== dottedName && !name.endsWith(' . $SITUATION'))
			.map((dottedName) => [dottedName, formatValueForStudio(node)]),
	)

	const source = encodeURIComponent(JSON.stringify({ rules, situation }))

	const baseURL =
		typeof window !== 'undefined' && location.hostname === 'localhost' ?
			''
		:	'https://publi.codes'

	return `${baseURL}/studio/${encodeRuleName(dottedName)}#${source}`
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
