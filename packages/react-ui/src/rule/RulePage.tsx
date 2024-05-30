import Engine, {
	EvaluatedNode,
	formatValue,
	PublicodesExpression,
	RuleNode,
	serializeUnit,
	utils,
} from 'publicodes'
import { useContext, useEffect, useRef } from 'react'
import { styled } from 'styled-components'
import {
	BasepathContext,
	defaultRenderers,
	DottedNameContext,
	EngineContext,
	RenderersContext,
	SupportedRenderers,
} from '../contexts'
import Explanation from '../Explanation'
import { useEngine } from '../hooks'
import { RuleLinkWithContext } from '../RuleLink'
import { DeveloperAccordion } from './DeveloperAccordion'
import RuleHeader from './Header'
import { breakpointsWidth, RulesNav } from './RulesNav'

type RulePageProps = {
	documentationPath: string
	rulePath: string
	engine: Engine
	language: 'fr' | 'en'
	renderers: SupportedRenderers
	searchBar?: boolean
	apiDocumentationUrl?: string
	apiEvaluateUrl?: string
	npmPackage?: string
	mobileMenuPortalId?: string
	openNavButtonPortalId?: string
	showDevSection?: boolean
}

export default function RulePage({
	documentationPath,
	rulePath,
	engine,
	renderers,
	searchBar,
	language,
	apiDocumentationUrl,
	apiEvaluateUrl,
	npmPackage,
	mobileMenuPortalId,
	openNavButtonPortalId,
	showDevSection = true,
}: RulePageProps) {
	const currentEngineId =
		typeof window !== 'undefined' &&
		new URLSearchParams(window.location.search).get('currentEngineId')

	const prevRenderers = useRef(renderers)
	useEffect(() => {
		if (prevRenderers.current !== renderers) {
			prevRenderers.current = renderers
		}
	}, [renderers])

	return (
		<EngineContext.Provider value={engine}>
			<BasepathContext.Provider value={documentationPath}>
				<RenderersContext.Provider value={defaultRenderers(renderers)}>
					<Rule
						dottedName={utils.decodeRuleName(rulePath)}
						subEngineId={
							currentEngineId ? parseInt(currentEngineId, 10) : undefined
						}
						language={language}
						apiDocumentationUrl={apiDocumentationUrl}
						apiEvaluateUrl={apiEvaluateUrl}
						npmPackage={npmPackage}
						mobileMenuPortalId={mobileMenuPortalId}
						openNavButtonPortalId={openNavButtonPortalId}
						showDevSection={showDevSection}
						searchBar={searchBar}
					/>
				</RenderersContext.Provider>
			</BasepathContext.Provider>
		</EngineContext.Provider>
	)
}

type RuleProps = {
	dottedName: string
	subEngineId?: number
} & Pick<
	RulePageProps,
	| 'language'
	| 'apiDocumentationUrl'
	| 'apiEvaluateUrl'
	| 'npmPackage'
	| 'mobileMenuPortalId'
	| 'openNavButtonPortalId'
	| 'showDevSection'
	| 'searchBar'
>

function Rule({
	dottedName,
	language,
	subEngineId,
	searchBar = false,
	apiDocumentationUrl,
	apiEvaluateUrl,
	npmPackage,
	mobileMenuPortalId,
	openNavButtonPortalId,
	showDevSection,
}: RuleProps) {
	const baseEngine = useEngine()
	const { References, Text } = useContext(RenderersContext)
	const subEngines = baseEngine.context.subEngines
	const useSubEngine = subEngineId && subEngines.has(subEngineId)
	const engine =
		useSubEngine ? (subEngines.get(subEngineId) as Engine) : baseEngine

	if (!(dottedName in engine.context.parsedRules)) {
		return <p>Cette règle est introuvable dans la base</p>
	}

	engine.resetCache()
	engine.cache.traversedVariablesStack = []
	const rule = engine.evaluateNode(
		engine.context.parsedRules[dottedName],
	) as EvaluatedNode<'rule'>

	const { description, question } = rule.rawNode
	const { valeur, nullableParent, ruleDisabledByItsParent } = rule.explanation

	const situation = buildSituationUsedInRule(engine, rule)

	const references = References?.({
		references: rule.rawNode.références,
		dottedName: rule.dottedName,
	})
	return (
		<EngineContext.Provider value={engine}>
			<Container id="documentation-rule-root">
				<RulesNav
					dottedName={dottedName}
					mobileMenuPortalId={mobileMenuPortalId}
					openNavButtonPortalId={openNavButtonPortalId}
					searchBar={searchBar}
				/>
				<Article>
					<DottedNameContext.Provider value={dottedName}>
						<RuleHeader dottedName={dottedName} />
						<section>
							<Text>{description || question || ''}</Text>
						</section>

						<p style={{ fontSize: '1.25rem', lineHeight: '2rem' }}>
							Valeur : {formatValue(rule, { language })}
							{rule.nodeValue === undefined && rule.unit && (
								<>
									<br />
									Unité : {serializeUnit(rule.unit)}
								</>
							)}
						</p>

						{ruleDisabledByItsParent && nullableParent && (
							<>
								<blockquote>
									Cette règle est <strong>non applicable</strong> car elle
									appartient à l’espace de nom :{' '}
									<Explanation node={nullableParent} />
								</blockquote>
							</>
						)}
						{useSubEngine && (
							<div
								style={{
									margin: '1rem 0',
									padding: '0rem 1rem',
									display: 'flex',
									justifyContent: 'flex-end',
									columnGap: '1rem',
									alignItems: 'baseline',
									flexWrap: 'wrap',
									background: 'hsl(220, 60%, 97.5%)',
									borderRadius: '0.25rem',
								}}
							>
								<p>
									Vous naviguez la documentation avec un{' '}
									<strong>contexte</strong> d’évaluation{' '}
									<strong>spécifique</strong>.
								</p>
								<div style={{ flex: 1 }} />
								<p
									style={{
										textAlign: 'right',
										marginTop: 0,
									}}
								>
									<RuleLinkWithContext
										dottedName={dottedName}
										useSubEngine={false}
									>
										Retourner à la version de base
									</RuleLinkWithContext>
								</p>
							</div>
						)}
						<h2>Comment cette donnée est-elle calculée ?</h2>
						<div id="documentation-rule-explanation">
							<Explanation node={valeur} />
						</div>

						{rule.rawNode.note && (
							<>
								<h3>Note</h3>
								<div>
									<Text>{rule.rawNode.note}</Text>
								</div>
							</>
						)}

						{references && (
							<>
								<h3>Références</h3>
								{references}
							</>
						)}
						<br />

						{showDevSection && (
							<>
								<h3>Informations techniques</h3>
								<Text>
									Si vous êtes développeur/euse vous trouverez ci-dessous des
									informations techniques utiles pour l’intégration de cette
									règle dans votre application.
								</Text>
								<DeveloperAccordion
									engine={engine}
									situation={situation}
									dottedName={dottedName}
									rule={rule}
									apiDocumentationUrl={apiDocumentationUrl}
									apiEvaluateUrl={apiEvaluateUrl}
									npmPackage={npmPackage}
								></DeveloperAccordion>
							</>
						)}
					</DottedNameContext.Provider>
				</Article>
			</Container>
		</EngineContext.Provider>
	)
}

const Container = styled.div`
	display: flex;
	flex-wrap: nowrap;
	align-items: flex-start;
	@media (max-width: ${breakpointsWidth.lg}) {
		flex-direction: column;
	}
`

const Article = styled.article`
	flex-shrink: 1;
	max-width: 100%;
	@media (min-width: ${breakpointsWidth.lg}) {
		min-width: 0;
		padding-left: 1rem;
		border-left: 1px solid #e6e6e6;
		margin-left: -1px;
	}
`

// We get related-to-rule variables from the current situation
function buildSituationUsedInRule<Names extends string>(
	engine: Engine<Names>,
	rule: EvaluatedNode & RuleNode,
): Partial<Record<Names, PublicodesExpression>> {
	const currentSituation = engine.getSituation()

	const situationUsedInRule = Object.fromEntries(
		Object.entries(currentSituation).filter(([dottedName]) => {
			if (dottedName === rule.dottedName) {
				return true
			}
			return rule.traversedVariables?.includes(dottedName)
		}),
	) as Record<Names, PublicodesExpression>

	return situationUsedInRule
}
