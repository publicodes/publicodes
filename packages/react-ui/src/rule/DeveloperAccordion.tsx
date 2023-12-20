import Engine, { EvaluatedNode, RuleNode, utils } from 'publicodes'
import { useContext } from 'react'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { RenderersContext } from '../contexts'
import RuleSource from './RuleSource'

const Ul = styled.ul`
	padding: 0;
	max-height: 400px;
	overflow: auto;
	list-style: none;
`

const Li = styled.li`
	position: relative;
	padding-left: 1.5rem;

	&::before {
		content: '●';
		font-size: 80%;
		display: inline-block;
		position: absolute;
		left: 0;
		width: 1.5rem;
		text-align: center;
		color: #b3b3b3;
		margin-bottom: 0.5rem;
	}
`

export function DeveloperAccordion({
	rule,
	engine,
	dottedName,
	situation = {},
	apiDocumentationUrl,
	apiEvaluateUrl,
	npmPackage,
}: {
	rule: EvaluatedNode<'rule'>
	engine: Engine
	dottedName: string
	situation?: Record<string, unknown>
	apiDocumentationUrl?: string
	apiEvaluateUrl?: string
	npmPackage?: string
}) {
	const { Accordion } = useContext(RenderersContext)

	const accordionItems = [
		{
			title: 'Règle et situation',
			id: 'rule-situation',
			children: (
				<>
					<ActualRule engine={engine} dottedName={dottedName} />

					<ActualSituation situation={situation} />
				</>
			),
		},
		(apiDocumentationUrl && apiEvaluateUrl) || npmPackage ?
			{
				title:
					'Réutiliser ce calcul (' +
					[
						apiDocumentationUrl && apiEvaluateUrl ? 'API REST' : null,
						npmPackage ? 'Paquet NPM' : null,
					]
						.filter((x) => x !== null)
						.join(' / ') +
					')',
				id: 'usage',
				children: (
					<>
						{utils.isExperimental(
							engine.baseContext.parsedRules,
							dottedName,
						) && (
							<StyledWarning>
								<h4>⚠️ Cette règle est tagguée comme experimentale ⚠️</h4>
								<p>
									Cela veut dire qu'elle peut être modifiée, renommée, ou
									supprimée sans qu'il n'y ait de changement de version majeure
									dans l'API.
								</p>
							</StyledWarning>
						)}
						{npmPackage && (
							<PackageUsage
								rule={rule}
								situation={situation}
								dottedName={dottedName}
								npmPackage={npmPackage}
							/>
						)}

						{apiDocumentationUrl && apiEvaluateUrl && (
							<ApiUsage
								situation={situation}
								dottedName={dottedName}
								apiDocumentationUrl={apiDocumentationUrl}
								apiEvaluateUrl={apiEvaluateUrl}
							/>
						)}
					</>
				),
			}
		:	null,
		{
			title: 'Dépendances et effets de la règle',
			id: 'dependencies-effects',
			children: (
				<>
					<MissingVars selfMissing={Object.keys(rule.missingVariables)} />

					<ReverseMissing
						engine={engine}
						dottedName={dottedName}
						ruleIsNotDefined={rule.nodeValue === undefined}
					/>

					<Effect
						engine={engine}
						dottedName={dottedName}
						replacements={rule.replacements}
					/>
				</>
			),
		},
	].filter(<T,>(elem: T | null): elem is T => elem !== null)

	return <Accordion items={accordionItems}></Accordion>
}

function ActualRule({
	engine,
	dottedName,
}: {
	engine: Engine<string>
	dottedName: string
}) {
	const { Code } = useContext(RenderersContext)

	return (
		<section>
			<h4>Règle actuelle</h4>
			<Code tabs={{ dottedName }} />
			<RuleSource dottedName={dottedName} engine={engine} />
		</section>
	)
}

function ActualSituation({
	situation,
}: {
	situation: Record<string, unknown>
}) {
	const { Code } = useContext(RenderersContext)

	const keys = Object.keys(situation)

	const tabs = {
		json: JSON.stringify(situation, null, 2),
	}

	return (
		<section>
			<h4>Situation actuelle</h4>
			{keys.length ?
				<p>
					Voici les données que vous avez saisies dans notre simulateur sous
					forme de JSON.
				</p>
			:	<p>
					Votre situation est pour l'instant vide, vous n'avez probablement pas
					encore fait de simulation.
				</p>
			}
			<Code tabs={tabs} />
		</section>
	)
}

const LINK_NPM_LABEL = 'Retrouvez ce paquet sur NPM'
const LINK_PUBLICODES_LABEL = 'moteur Publicodes'

function PackageUsage({
	rule,
	situation,
	dottedName,
	npmPackage,
}: {
	rule: EvaluatedNode<'rule'>
	situation: Record<string, unknown>
	dottedName: string
	npmPackage: string
}) {
	const { Code, Link } = useContext(RenderersContext)

	const tabs = {
		npmPackage: `// npm i publicodes ${npmPackage}

import Engine, { formatValue } from 'publicodes'
import rules from '${npmPackage}'

const engine = new Engine(rules)
engine.setSituation(${JSON.stringify(situation, null, 2)})

// ${rule.title}
const evaluation = engine.evaluate(${JSON.stringify(dottedName)})

console.log(formatValue(evaluation))
`,
	}

	return (
		<section>
			<h4>Lancer un calcul avec Publicodes</h4>
			<p>
				Vous pouvez installer notre package de règles pour l'utiliser avec le{' '}
				<Link
					aria-label={`${LINK_PUBLICODES_LABEL}, accéder au site publi.codes, nouvelle fenêtre`}
					href="https://publi.codes/"
				>
					{LINK_PUBLICODES_LABEL}
				</Link>{' '}
				et ainsi effectuer vos propres calculs. Voici un exemple avec votre
				situation et la règle actuelle :
			</p>
			<Code tabs={tabs} />

			<p style={{ textAlign: 'right' }}>
				<Link
					href={'https://www.npmjs.com/package/' + npmPackage}
					aria-label={`${LINK_NPM_LABEL}, accéder à la page npm du package Publicodes, nouvelle fenêtre`}
				>
					<span aria-hidden>📦</span> {LINK_NPM_LABEL}
				</Link>
			</p>
		</section>
	)
}

const LINK_API_LABEL = 'En savoir plus sur notre API REST'

function ApiUsage({
	situation,
	dottedName,
	apiDocumentationUrl,
	apiEvaluateUrl,
}: {
	situation: Record<string, unknown>
	dottedName: string
	apiDocumentationUrl: string
	apiEvaluateUrl: string
}) {
	const { Code, Link } = useContext(RenderersContext)

	const data = {
		expressions: [dottedName],
		situation: situation,
	}

	const tabs = {
		curl: `curl '${apiEvaluateUrl}' \\
  -H 'accept: application/json' \\
  -H 'content-type: application/json' \\
  --data-raw $'${JSON.stringify(data).replace(/'/g, "'\\''")}' \\
  --compressed`,
		'fetch js': `const request = await fetch("${apiEvaluateUrl}", {
  "headers": { "content-type": "application/json" },
  "method": "POST",
  "body": JSON.stringify(${JSON.stringify(data, null, 2)}),
})
const { evaluate } = await request.json()

console.log(evaluate)`,
	}

	return (
		<section>
			<h4>Utiliser notre API REST</h4>
			<p>
				Vous trouverez ici un exemple d'utilisation de notre API REST via curl
				ou un fetch javascript.
			</p>
			<Code tabs={tabs} />
			{apiDocumentationUrl && (
				<p style={{ textAlign: 'right' }}>
					<Link
						to={apiDocumentationUrl}
						aria-label={`${LINK_API_LABEL}, accéder à la documentation, nouvelle fenêtre`}
					>
						<span aria-hidden>👩‍💻</span> {LINK_API_LABEL}
					</Link>
				</p>
			)}
		</section>
	)
}

function MissingVars({ selfMissing }: { selfMissing: string[] }) {
	return (
		<section>
			<h4>Données manquantes</h4>
			{!!selfMissing?.length ?
				<>
					<p>
						Les règles suivantes sont nécessaires pour le calcul mais n'ont pas
						été saisies dans la situation. Leur valeur par défaut est utilisée.
					</p>

					<Ul>
						{selfMissing.map((dottedName) => (
							<Li key={dottedName}>
								<RuleLinkWithContext dottedName={dottedName} />
							</Li>
						))}
					</Ul>
				</>
			:	<p>Il n'y a pas de données manquante.</p>}
		</section>
	)
}

const isReplacementOfThisRule = (node: RuleNode, dottedName: string) =>
	node &&
	'replacements' in node &&
	node.replacements.some(
		({ replacedReference }) => replacedReference.dottedName === dottedName,
	)

function ReverseMissing({
	engine,
	dottedName,
	ruleIsNotDefined = false,
}: {
	engine: Engine
	dottedName: string
	ruleIsNotDefined?: boolean
}) {
	const ruleNamesWithMissing = Array.from(
		engine.context.referencesMaps.rulesThatUse.get(dottedName) ?? [],
	).filter(
		(ruleName) =>
			ruleName !== '$EVALUATION' &&
			ruleName in engine.context.parsedRules &&
			!engine.context.parsedRules[ruleName].private &&
			!isReplacementOfThisRule(
				engine.context.parsedRules[ruleName],
				dottedName,
			),
	)

	return (
		<section>
			<h4>Règles qui ont besoin de cette valeur</h4>

			{ruleNamesWithMissing.length ?
				<>
					<p>
						Les règles suivantes ont besoin de la règle courante pour être
						calculées :
						{ruleIsNotDefined && (
							<>
								{' '}
								La règle courante n'étant pas encore définie, c'est sa valeur
								par défaut qui est utilisée pour déterminer la valeur de ces
								règles.
							</>
						)}
					</p>
					<Ul>
						{ruleNamesWithMissing.map((dottedName) => (
							<Li key={dottedName}>
								<RuleLinkWithContext dottedName={dottedName} />
							</Li>
						))}
					</Ul>
				</>
			:	<p>Aucune règle n'utilise cette valeur.</p>}
		</section>
	)
}

function Effect({
	engine,
	dottedName,
	replacements,
}: {
	engine: Engine
	dottedName: string
	replacements: RuleNode['replacements']
}) {
	const effects = Array.from(
		engine.context.referencesMaps.rulesThatUse.get(dottedName) ?? [],
	).filter(
		(ruleName) =>
			ruleName !== '$EVALUATION' &&
			ruleName in engine.context.parsedRules &&
			!engine.context.parsedRules[ruleName].private &&
			isReplacementOfThisRule(engine.context.parsedRules[ruleName], dottedName),
	)

	return (
		<>
			<section>
				<h4>Effets sur d'autres règles</h4>
				{!!replacements.length ?
					<>
						<p>
							Une règle peut avoir des effets sur d'autres règles afin de
							modifier leur comportement.
						</p>
						<Ul>
							{replacements.map((replacement) => (
								<Li
									style={{ marginBottom: '0.5rem' }}
									key={replacement.replacedReference.dottedName}
								>
									<Explanation node={replacement} />
								</Li>
							))}
						</Ul>
					</>
				:	<p>Cette règle ne modifie aucune autre règle.</p>}
			</section>

			<section>
				<h4>Règles qui peuvent avoir un effet sur cette valeur</h4>
				{effects.length ?
					<>
						<p>
							Les règles suivantes peuvent remplacer la valeur de la règle
							courante :
						</p>
						<Ul>
							{effects.map((dottedName) => (
								<Li key={dottedName}>
									<RuleLinkWithContext dottedName={dottedName} />
								</Li>
							))}
						</Ul>
					</>
				:	<p>Aucune autre règle n'a d'effet sur cette valeur.</p>}
			</section>
		</>
	)
}

const StyledWarning = styled.div``
