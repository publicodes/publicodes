import Engine, {
	ASTNode,
	EvaluatedNode,
	formatValue,
	PublicodesExpression,
	RuleNode,
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
	apiDocumentationUrl?: string
	apiEvaluateUrl?: string
	npmPackage?: string
	mobileMenuPortalId?: string
	openNavButtonPortalId?: string
	showDevSection?: boolean
	contributionLink?: {
		repository: string
		// e.g. repository: 'datagir/nosgestesclimat',
		directory: string
		// e.g. directory: 'data',
		title?: string
		text?: string
	}
}

export default function RulePage({
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
	contributionLink,
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
						apiDocumentationUrl={apiDocumentationUrl}
						apiEvaluateUrl={apiEvaluateUrl}
						npmPackage={npmPackage}
						mobileMenuPortalId={mobileMenuPortalId}
						openNavButtonPortalId={openNavButtonPortalId}
						showDevSection={showDevSection}
						contributionLink={contributionLink}
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
	| 'contributionLink'
>

function Rule({
	dottedName,
	language,
	subEngineId,
	apiDocumentationUrl,
	apiEvaluateUrl,
	npmPackage,
	mobileMenuPortalId,
	openNavButtonPortalId,
	showDevSection,
	contributionLink,
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

	const situation = buildSituationUsedInRule(engine, rule)

	return (
		<EngineContext.Provider value={engine}>
			<Container id="documentation-rule-root">
				<RulesNav
					dottedName={dottedName}
					mobileMenuPortalId={mobileMenuPortalId}
					openNavButtonPortalId={openNavButtonPortalId}
				/>
				<Article>
					<DottedNameContext.Provider value={dottedName}>
						<RuleHeader dottedName={dottedName} />
						{question && (
							<section id="documentation-rule-question">
								<Text>{question}</Text>
							</section>
						)}
						<section>
							<Text>{description || ''}</Text>
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
						{rule.rawNode.références && References && (
							<>
								<h3>Références</h3>
								<References references={rule.rawNode.références} />
							</>
						)}

						{contributionLink && ( // Feature only implemented for github for now, don't hesitate to implement Gitlab and others
							<div>
								<h3>
									{contributionLink.title ||
										`Une erreur, une idée d'amélioration ?`}
								</h3>
								<a
									href={`https://github.com/search?q=${encodeURIComponent(
										`repo:${contributionLink.repository} "${dottedName}:"`
									)} path:${contributionLink.directory}&type=code`}
								>
									{contributionLink.text || `✏️  Contribuer à cette page`}
								</a>
							</div>
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
