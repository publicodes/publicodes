import Engine, {
	EvaluatedNode,
	RuleNode,
	serializeEvaluation,
} from 'publicodes'
import { useContext } from 'react'
import styled from 'styled-components'
import { RenderersContext } from '../contexts'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
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
	engine,
	rule,
	dottedName,
	situation = {},
	apiDocumentationUrl,
	apiExampleUrl,
}: {
	engine: Engine
	rule: EvaluatedNode & { nodeKind: 'rule' }
	dottedName: string
	situation?: Record<string, unknown>
	apiDocumentationUrl?: string
	apiExampleUrl?: string
}) {
	const { Accordion } = useContext(RenderersContext)

	const accordionItems = [
		{
			title: 'Données',
			id: 'data',
			children: (
				<>
					<ActualRule engine={engine} dottedName={dottedName} />

					<ActualSituation
						engine={engine}
						situation={situation}
						dottedName={dottedName}
						apiDocumentationUrl={apiDocumentationUrl}
						apiExampleUrl={apiExampleUrl}
					/>
				</>
			),
		},
		{
			title: 'Hiérarchie des règles',
			id: 'hierarchy',
			children: (
				<>
					<MissingVars selfMissing={Object.keys(rule.missingVariables)} />

					<ReverseMissing
						engine={engine}
						dottedName={dottedName}
						ruleIsNotDefined={rule.nodeValue === undefined}
					/>

					<Effect replacements={rule.replacements} />
				</>
			),
		},
	]

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
	engine,
	situation,
	dottedName,
	apiDocumentationUrl,
	apiExampleUrl,
}: {
	engine: Engine<string>
	situation: Record<string, unknown>
	dottedName: string
	apiDocumentationUrl?: string
	apiExampleUrl?: string
}) {
	const { Code, Link } = useContext(RenderersContext)

	const keys = Object.keys(situation)
	const evaluatedSituation = Object.fromEntries(
		keys.map((dot) => [dot, serializeEvaluation(engine.evaluate(dot))])
	)

	const data = JSON.stringify({
		expressions: [dottedName],
		situation: evaluatedSituation,
	}).replace(/'/g, "'\\''")

	const tabs = {
		json: JSON.stringify(evaluatedSituation, null, 2),
		...(apiExampleUrl && {
			curl: `curl '${apiExampleUrl}' \\
  -H 'accept: application/json' \\
  -H 'content-type: application/json' \\
  --data-raw $'${data}' \\
  --compressed`,
		}),
	}

	return (
		<section>
			<h4>Situation actuelle</h4>
			{keys.length ? (
				<p>
					Voici les données que vous avez saisies dans notre simulateur sous
					forme de JSON.
				</p>
			) : (
				<p>
					Votre situation est pour l'instant vide, vous n'avez probablement pas
					encore fait de simulation.
				</p>
			)}
			<Code tabs={tabs} />

			{apiDocumentationUrl && (
				<p style={{ textAlign: 'right' }}>
					<Link to={apiDocumentationUrl}>
						👩‍💻 Utilisez cette situation avec notre API REST
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
			{!!selfMissing?.length ? (
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
			) : (
				<p>Il n'y a pas de données manquante.</p>
			)}
		</section>
	)
}

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
		engine.context.referencesMaps.rulesThatUse.get(dottedName) ?? []
	).filter((ruleName) => !engine.context.parsedRules[ruleName].private)

	return (
		<section>
			<h4>Règles qui ont besoin de cette valeur</h4>

			{ruleNamesWithMissing.length ? (
				<>
					<p>
						Les règles suivantes ont besoin de la règle courante pour être
						calculées.
						{ruleIsNotDefined && (
							<>
								{' '}
								Or, la règle courante n'étant pas encore définie, c'est sa
								valeur par défaut qui est utilisée pour déterminer la valeur de
								ces règles.
							</>
						)}
					</p>
					<Ul>
						{(() => {
							return ruleNamesWithMissing.length
								? ruleNamesWithMissing.map((dottedName) => (
										<Li key={dottedName}>
											<RuleLinkWithContext dottedName={dottedName} />
										</Li>
								  ))
								: 'Aucune autre règle ne dépend de la règle courante.'
						})()}
					</Ul>
				</>
			) : (
				<p>Aucune règle n'utilise cette valeur.</p>
			)}
		</section>
	)
}

function Effect({ replacements }: { replacements: RuleNode['replacements'] }) {
	return (
		<section>
			<h4>Effets</h4>
			{!!replacements.length ? (
				<>
					<p>
						Une règle peut modifier d'autres règles afin de modifier leur
						comportement.
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
			) : (
				<p>Cette règle ne modifie aucune autre règle.</p>
			)}
		</section>
	)
}
