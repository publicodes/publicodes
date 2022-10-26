import Engine, {
	EvaluatedNode,
	formatValue,
	serializeUnit,
	utils,
} from 'publicodes'
import { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
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
	situation?: Record<string, unknown>
	apiDocumentationUrl?: string
	apiEvaluateUrl?: string
	npmPackage?: string
	mobileMenuPortalId?: string
	openNavButtonPortalId?: string
}

export default function RulePage({
	documentationPath,
	rulePath,
	engine,
	renderers,
	language,
	situation,
	apiDocumentationUrl,
	apiEvaluateUrl,
	npmPackage,
	mobileMenuPortalId,
	openNavButtonPortalId,
}: RulePageProps) {
	const currentEngineId = new URLSearchParams(window.location.search).get(
		'currentEngineId'
	)

	const prevRenderers = useRef(renderers)
	const [renderersValue, setRenderers] = useState(defaultRenderers(renderers))
	useEffect(() => {
		if (prevRenderers.current !== renderers) {
			prevRenderers.current = renderers

			setRenderers(defaultRenderers(renderers))
		}
	}, [renderers])

	return (
		<EngineContext.Provider value={engine}>
			<BasepathContext.Provider value={documentationPath}>
				<RenderersContext.Provider value={renderersValue}>
					<Rule
						dottedName={utils.decodeRuleName(rulePath)}
						subEngineId={
							currentEngineId ? parseInt(currentEngineId) : undefined
						}
						language={language}
						situation={situation}
						apiDocumentationUrl={apiDocumentationUrl}
						apiEvaluateUrl={apiEvaluateUrl}
						npmPackage={npmPackage}
						mobileMenuPortalId={mobileMenuPortalId}
						openNavButtonPortalId={openNavButtonPortalId}
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
	situation?: Record<string, unknown>
	apiDocumentationUrl?: string
	apiEvaluateUrl?: string
	npmPackage?: string
	mobileMenuPortalId?: string
	openNavButtonPortalId?: string
}

function Rule({
	dottedName,
	language,
	subEngineId,
	situation = {},
	apiDocumentationUrl,
	apiEvaluateUrl,
	npmPackage,
	mobileMenuPortalId,
	openNavButtonPortalId,
}: RuleProps) {
	const baseEngine = useEngine()
	const { References, Text } = useContext(RenderersContext)

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
	) as EvaluatedNode & { nodeKind: 'rule' }

	const { description, question } = rule.rawNode
	const { valeur, nullableParent, ruleDisabledByItsParent } = rule.explanation

	return (
		<Container id="documentation-rule-root">
			<RulesNav
				dottedName={dottedName}
				mobileMenuPortalId={mobileMenuPortalId}
				openNavButtonPortalId={openNavButtonPortalId}
			/>
			<Article>
				<DottedNameContext.Provider value={dottedName}>
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
								<strong>mécanisme recalcul</strong>
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

					<h2>Comment cette donnée est-elle calculée ?</h2>
					<Explanation node={valeur} />

					{rule.rawNode.note && (
						<>
							<h3>Note</h3>
							<div>
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
					<br />

					<h3>Informations pour les développeurs</h3>
					<Text>
						Vous trouverez ci-dessous des informations techniques qui peuvent
						être utiles aux développeurs
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
				</DottedNameContext.Provider>
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
