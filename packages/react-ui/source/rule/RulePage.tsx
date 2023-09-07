import { ActionData } from '@publicodes/worker'
import {
	SuspensePromise,
	WorkerEngine,
	usePromise,
} from '@publicodes/worker-react'
import Engine, {
	ASTNode,
	EvaluatedNode,
	PublicodesExpression,
	RuleNode,
	formatValue,
	serializeUnit,
	utils,
} from 'publicodes'

import { useContext, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import { executeAction } from '../actions'
import {
	BasepathContext,
	DottedNameContext,
	RenderersContext,
	SupportedRenderers,
	defaultRenderers,
} from '../contexts'
import {
	EngineContextProvider,
	useEngine,
	useSubEngineId,
} from '../hooks/useEngine'
import { DeveloperAccordion } from './DeveloperAccordion'
import RuleHeader from './Header'
import { RulesNav, breakpointsWidth } from './RulesNav'

type RulePageProps = {
	isSSR: boolean
	documentationPath: string
	rulePath: string
	engine: Engine | WorkerEngine
	language: 'fr' | 'en'
	renderers: SupportedRenderers
	apiDocumentationUrl?: string
	apiEvaluateUrl?: string
	npmPackage?: string
	mobileMenuPortalId?: string
	openNavButtonPortalId?: string
	showDevSection?: boolean
}

type AsyncRulePageProps = Omit<RulePageProps, 'engine'> & {
	engine: WorkerEngine
}

export default function RulePage({
	isSSR,
	documentationPath,
	rulePath,
	engine,
	renderers,
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
	const [renderersValue, setRenderers] = useState(defaultRenderers(renderers))
	useEffect(() => {
		if (prevRenderers.current !== renderers) {
			prevRenderers.current = renderers

			setRenderers(defaultRenderers(renderers))
		}
	}, [renderers])

	const subEngineId = currentEngineId ? parseInt(currentEngineId) : undefined

	return (
		<EngineContextProvider value={{ engine, subEngineId }}>
			<BasepathContext.Provider value={documentationPath}>
				<RenderersContext.Provider value={defaultRenderers(renderers)}>
					<Rule
						isSSR={isSSR}
						dottedName={utils.decodeRuleName(rulePath)}
						language={language}
						apiDocumentationUrl={apiDocumentationUrl}
						apiEvaluateUrl={apiEvaluateUrl}
						npmPackage={npmPackage}
						mobileMenuPortalId={mobileMenuPortalId}
						openNavButtonPortalId={openNavButtonPortalId}
						showDevSection={showDevSection}
					/>
				</RenderersContext.Provider>
			</BasepathContext.Provider>
		</EngineContextProvider>
	)
}

type RuleProps = {
	isSSR: boolean
	dottedName: string
} & Pick<
	RulePageProps,
	| 'language'
	| 'apiDocumentationUrl'
	| 'apiEvaluateUrl'
	| 'npmPackage'
	| 'mobileMenuPortalId'
	| 'openNavButtonPortalId'
	| 'showDevSection'
>

function buildSituationUsedInRule<Names extends string>(
	engine: Engine<Names>,
	rule: EvaluatedNode & RuleNode
): Partial<Record<Names, PublicodesExpression>> {
	const situation = [...(rule.traversedVariables as Names[]), rule.dottedName]
		.map((name) => {
			const valeur = engine.context.parsedRules[`${name} . $SITUATION`]?.rawNode
				.valeur as ASTNode
			return [name, valeur] as const
		})
		.filter(
			([_, valeur]) =>
				valeur &&
				!(valeur.nodeKind === 'constant' && valeur.nodeValue === undefined)
		)
		.reduce(
			(acc, [name, valeur]) => ({
				[name]:
					typeof valeur === 'object' && valeur && 'rawNode' in valeur
						? valeur.rawNode
						: valeur,
				...acc,
			}),
			{}
		)

	return situation
}

export const getRuleData = (
	{ engine: baseEngine }: ActionData,
	{ dottedName, subEngineId }: { dottedName: string; subEngineId?: number }
) => {
	const useSubEngine =
		typeof subEngineId === 'number' &&
		baseEngine.subEngines.length >= subEngineId

	const engine = useSubEngine ? baseEngine.subEngines[subEngineId] : baseEngine

	if (!(dottedName in engine.context.parsedRules)) {
		return null
	}

	const rule = engine.evaluateNode(
		engine.context.parsedRules[dottedName]
	) as EvaluatedNode & { nodeKind: 'rule' }

	const situation = buildSituationUsedInRule(engine, rule)

	return { useSubEngine, rule, situation }
}

function Rule({
	isSSR,
	dottedName,
	language,
	apiDocumentationUrl,
	apiEvaluateUrl,
	npmPackage,
	mobileMenuPortalId,
	openNavButtonPortalId,
	showDevSection,
}: RuleProps) {
	const { References, Text } = useContext(RenderersContext)
	const baseEngine = useEngine()
	const subEngineId = useSubEngineId()

	const res = usePromise(
		() => executeAction(baseEngine, 'getRuleData', { dottedName, subEngineId }),
		[baseEngine, dottedName, subEngineId]
	)

	if (res === undefined) {
		return <>loading...</>
	}
	if (res === null) {
		return <p>Cette règle est introuvable dans la base</p>
	}

	const { rule, situation, useSubEngine } = res
	const { description, question } = rule.rawNode
	const { valeur, nullableParent, ruleDisabledByItsParent } = rule.explanation

	const references = References?.({
		references: rule.rawNode.références,
		dottedName: rule.dottedName,
	})

	return (
		<Container id="documentation-rule-root">
			<SuspensePromise isSSR={isSSR}>
				<RulesNav
					dottedName={dottedName}
					mobileMenuPortalId={mobileMenuPortalId}
					openNavButtonPortalId={openNavButtonPortalId}
				/>
			</SuspensePromise>
			<Article>
				<SuspensePromise isSSR={isSSR}>
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

						{ruleDisabledByItsParent && (
							<>
								<blockquote>
									Cette règle est <strong>non applicable</strong> car elle
									appartient à l'espace de nom :{' '}
									<Explanation node={nullableParent} />
								</blockquote>
							</>
						)}
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
									Les valeurs affichées sont calculées avec la situation
									spécifique du <strong>mécanisme recalcul</strong>
								</div>
								<div style={{ flex: 1 }} />
								<div>
									<RuleLinkWithContext
										dottedName={dottedName}
										useSubEngine={false}
									>
										Retourner à la version de base
									</RuleLinkWithContext>
								</div>
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
									informations techniques utiles pour l'intégration de cette
									règle dans votre application.
								</Text>

								<DeveloperAccordion
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
				</SuspensePromise>
			</Article>
		</Container>
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
