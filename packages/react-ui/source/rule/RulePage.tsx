import Engine, {
	EvaluatedNode,
	formatValue,
	serializeUnit,
	utils,
} from 'publicodes'
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import {
	BasepathContext,
	DefaultTextRenderer,
	EngineContext,
	RenderersContext,
	SupportedRenderers,
} from '../contexts'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import RuleHeader from './Header'
import { breakpointsWidth, RulesNav } from './RulesNav'
import RuleSource from './RuleSource'

type RulePageProps = {
	documentationPath: string
	rulePath: string
	engine: Engine
	language: 'fr' | 'en'
	renderers: SupportedRenderers
}

export default function RulePage({
	documentationPath,
	rulePath,
	engine,
	renderers,
	language,
}: RulePageProps) {
	const currentEngineId = new URLSearchParams(window.location.search).get(
		'currentEngineId'
	)

	return (
		<EngineContext.Provider value={engine}>
			<BasepathContext.Provider value={documentationPath}>
				<RenderersContext.Provider
					value={{ Text: DefaultTextRenderer, ...renderers }}
				>
					<Rule
						dottedName={utils.decodeRuleName(rulePath)}
						subEngineId={
							currentEngineId ? parseInt(currentEngineId) : undefined
						}
						language={language}
					/>
				</RenderersContext.Provider>
			</BasepathContext.Provider>
		</EngineContext.Provider>
	)
}

type RuleProps = {
	dottedName: string
	subEngineId?: number
	language: RulePageProps['language']
}

export function Rule({ dottedName, language, subEngineId }: RuleProps) {
	const baseEngine = useContext(EngineContext)
	const { References, Text } = useContext(RenderersContext)
	if (!baseEngine) {
		throw new Error('Engine expected')
	}

	const useSubEngine =
		subEngineId && baseEngine.subEngines.length >= subEngineId

	const engine = useSubEngine
		? baseEngine.subEngines[subEngineId as number]
		: baseEngine

	if (!(dottedName in engine.context.parsedRules)) {
		return <p>Cette règle est introuvable dans la base</p>
	}
	const rule = engine.evaluateNode(
		engine.context.parsedRules[dottedName]
	) as EvaluatedNode & {
		nodeKind: 'rule'
	}
	console.log(rule)
	const { description, question } = rule.rawNode
	const { valeur, nullableParent, ruleDisabledByItsParent } = rule.explanation

	return (
		<Container id="documentationRuleRoot">
			<RulesNav dottedName={dottedName} />

			<Article>
				{useSubEngine && (
					<div
						style={{
							display: 'flex',
							alignItems: 'baseline',
							flexWrap: 'wrap',
							margin: '1rem 0',
							paddingTop: '0.4rem',
							paddingBottom: '0.4rem',
						}}
					>
						<div>
							Vous explorez la documentation avec le contexte{' '}
							<strong className="ui__ label">mécanisme recalcul</strong>
						</div>
						<div style={{ flex: 1 }} />
						<div>
							<RuleLinkWithContext dottedName={dottedName} useSubEngine={false}>
								Retourner à la version de base
							</RuleLinkWithContext>
						</div>
					</div>
				)}
				<RuleHeader dottedName={dottedName} />
				<section>
					<Text>{description || question || ''}</Text>
				</section>
				{
					<>
						<p
							style={{
								fontSize: '1.25rem',
								lineHeight: '2rem',
							}}
						>
							Valeur : {formatValue(rule, { language })}
							{rule.nodeValue === undefined && rule.unit && (
								<>
									<br />
									Unité : {serializeUnit(rule.unit)}
								</>
							)}
						</p>
					</>
				}
				{ruleDisabledByItsParent && (
					<>
						<blockquote>
							Cette règle est <strong>non applicable</strong> car elle
							appartient à l'espace de nom :{' '}
							<Explanation node={nullableParent} />
						</blockquote>
					</>
				)}
				<h2>Comment cette donnée est-elle calculée ?</h2>

				<Explanation node={valeur} />
				{dottedName in engine.getParsedRules() && (
					<RuleSource
						key={dottedName}
						dottedName={dottedName}
						engine={engine}
					/>
				)}

				{rule.missingVariables && (
					<MissingVars
						dottedName={dottedName}
						selfMissing={Object.keys(rule.missingVariables)}
					/>
				)}

				{rule.nodeValue === undefined && (
					<ReverseMissing dottedName={dottedName} engine={engine} />
				)}

				{!!rule.replacements.length && (
					<>
						<h3>Effets </h3>
						<ul>
							{rule.replacements.map((replacement) => (
								<li key={replacement.replacedReference.dottedName}>
									<Explanation node={replacement} />
								</li>
							))}
						</ul>
					</>
				)}

				<NamespaceChildrenRules dottedName={dottedName} engine={engine} />

				{rule.rawNode.note && (
					<>
						<h3>Note</h3>
						<div className="ui__ notice">
							<Text>{rule.rawNode.note}</Text>
						</div>
					</>
				)}
				{rule.rawNode.références && References && (
					<>
						<h3>Références</h3>
						<References references={rule.rawNode.références} />
					</>
				)}
			</Article>
		</Container>
	)
}

const Container = styled.div`
	display: flex;
	flex-wrap: nowrap;
	flex-direction: row;
	gap: 2rem;

	@media (max-width: ${breakpointsWidth.md}) {
		flex-direction: column;
	}
`

const Article = styled.article`
	flex-basis: 70%;
`

function MissingVars({
	dottedName,
	selfMissing,
}: {
	dottedName: string
	selfMissing: string[] | null
}) {
	const [opened, setOpened] = useState(false)
	useEffect(() => {
		setOpened(false)
	}, [dottedName])

	if (!selfMissing || selfMissing.length === 0) {
		return null
	}

	return (
		<>
			<span>
				<h3 style={{ display: 'inline-block', marginRight: '1rem' }}>
					Données manquantes
				</h3>
				<a
					onClick={() => {
						setOpened(!opened)
					}}
				>
					{opened ? 'cacher' : 'voir la liste'}
				</a>
			</span>
			{opened && (
				<>
					<p className="ui__ notice">
						Les règles suivantes sont nécessaires pour le calcul mais n'ont pas
						été saisies dans la situation. Leur valeur par défaut est utilisée.
					</p>

					<ul>
						{selfMissing.map((dottedName) => (
							<li key={dottedName}>
								<RuleLinkWithContext dottedName={dottedName} />
							</li>
						))}
					</ul>
				</>
			)}
		</>
	)
}

function ReverseMissing({
	dottedName,
	engine,
}: {
	dottedName: string
	engine: Engine
}) {
	const [opened, setOpened] = useState(false)
	useEffect(() => {
		setOpened(false)
	}, [dottedName])

	const getRuleNamesWithMissing = () =>
		Object.keys(engine.getParsedRules()).filter((ruleName) => {
			const evaluation = engine.evaluateNode(engine.getRule(ruleName))
			return evaluation.missing?.self?.includes(dottedName)
		})

	return (
		<section>
			<span>
				<h3 style={{ display: 'inline-block', marginRight: '1rem' }}>
					Règles qui ont besoin de cette valeur
				</h3>
				<a
					onClick={() => {
						setOpened(!opened)
					}}
				>
					{opened ? 'cacher' : 'voir la liste'}
				</a>
			</span>

			{opened && (
				<>
					<p className="ui__ notice">
						Les règles suivantes ont besoin de la règle courante pour être
						calculées. Or, la règle courante n'étant pas encore définie, c'est
						sa valeur par défaut qui est utilisée pour déterminer la valeur de
						ces règles.
					</p>
					<ul>
						{(() => {
							const ruleNamesWithMissing = getRuleNamesWithMissing()
							return ruleNamesWithMissing.length
								? ruleNamesWithMissing.map((dottedName) => (
										<li key={dottedName}>
											<RuleLinkWithContext dottedName={dottedName} />
										</li>
								  ))
								: 'Aucune autre règle ne dépend de la règle courante.'
						})()}
					</ul>
				</>
			)}
		</section>
	)
}

function NamespaceChildrenRules({
	dottedName,
	engine,
}: {
	dottedName: string
	engine: Engine
}) {
	const namespaceChildrenRules = Object.keys(engine.getParsedRules())
		.filter(
			(ruleDottedName) =>
				ruleDottedName.startsWith(dottedName) &&
				ruleDottedName.split(' . ').length ===
					dottedName.split(' . ').length + 1
		)
		.filter((rule) => utils.ruleWithDedicatedDocumentationPage(rule))
	if (!namespaceChildrenRules.length) {
		return null
	}
	return (
		<section>
			<h2>Règles enfants </h2>
			<ul>
				{namespaceChildrenRules.map((dottedName) => (
					<li key={dottedName}>
						<RuleLinkWithContext dottedName={dottedName} />
					</li>
				))}
			</ul>
		</section>
	)
}
