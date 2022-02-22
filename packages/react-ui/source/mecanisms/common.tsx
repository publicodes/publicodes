import { capitalise0, formatValue, simplifyNodeUnit } from 'publicodes'
import {
	EvaluatedNode,
	Evaluation,
	Types,
	Unit,
} from 'publicodes/source/AST/types'
import { ReferenceNode } from 'publicodes/source/reference'
import React, { createContext, useContext, useState } from 'react'
import styled, { css } from 'styled-components'
import { EngineContext, RenderersContext } from '../contexts'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import mecanismColors from './colors'

export function ConstantNode({ nodeValue, type, fullPrecision, unit }) {
	if (nodeValue === null) {
		return null
	} else if (type === 'objet') {
		return (
			<code>
				<pre>{JSON.stringify(nodeValue, null, 2)}</pre>
			</code>
		)
	} else if (fullPrecision) {
		return (
			<span className={type}>
				{formatValue(
					{ nodeValue, unit },
					{
						precision: 5,
					}
				)}
			</span>
		)
	} else {
		return <span className="value">{formatValue({ nodeValue, unit })}</span>
	}
}

type NodeValuePointerProps = {
	data: Evaluation<Types>
	unit: Unit | undefined
}

export const NodeValuePointer = ({ data, unit }: NodeValuePointerProps) => {
	const engine = useContext(EngineContext)
	return (
		<StyledNodeValuePointer>
			{formatValue(simplifyNodeUnit({ nodeValue: data, unit }), {
				formatUnit: engine?.getOptions()?.formatUnit,
			})}
		</StyledNodeValuePointer>
	)
}

const StyledNodeValuePointer = styled.span`
	background: white;
	border-bottom: 0 !important;
	font-size: 0.875rem;
	line-height: 1.25rem;
	margin: 0 0.2rem;
	padding: 0.1rem 0.2rem;
	text-decoration: none !important;
	box-shadow: 0px 1px 2px 1px #d9d9d9, 0 0 0 1px #d9d9d9;
	border: 1px solid #f8f9fa;
	border-radius: 0.2rem;
`

// Un élément du graphe de calcul qui a une valeur interprétée (à afficher)
type NodeProps = {
	name: string
	value: Evaluation<Types>
	unit?: Unit
	children: React.ReactNode
	displayName?: boolean
}

export function Mecanism({
	name,
	value,
	children,
	unit,
	displayName = true,
}: NodeProps) {
	return (
		<StyledMecanism name={name}>
			{displayName && <MecanismName name={name}>{name}</MecanismName>}
			<>
				{children}

				{value != null && (
					<StyledMecanismValue>
						<small> =&nbsp;</small>
						<NodeValuePointer data={value} unit={unit} />
					</StyledMecanismValue>
				)}
			</>
		</StyledMecanism>
	)
}
const StyledMecanismValue = styled.div`
	text-align: right;
	margin-top: 0.4rem;
	font-weight: bold;
`

export const InfixMecanism = ({
	value,
	prefixed,
	children,
	dimValue,
}: {
	value: EvaluatedNode
	children: React.ReactNode
	prefixed?: boolean
	dimValue?: boolean
}) => {
	return (
		<StyledInfixMecanism className="infix-mecanism">
			{prefixed && children}
			<div
				className="value"
				style={{
					position: 'relative',
				}}
			>
				{dimValue && <DimOverlay />}
				<Explanation node={value} />
			</div>
			{!prefixed && children}
		</StyledInfixMecanism>
	)
}
const DimOverlay = styled.div`
	position: absolute;
	top: 0;
	bottom: 0;
	right: 0;
	background-color: white;
	left: 0;
	opacity: 0.5;
	pointer-events: none;
	z-index: 1;
`

const StyledInfixMecanism = styled.div`
	.value > .infix-mecanism {
		border: none;
		padding: 0;
	}
	.value > :not(.infix-mecanism):not(${DimOverlay}) {
		margin-bottom: 1rem;
	}
`

export const InlineMecanismName = ({ name }: { name: string }) => {
	return (
		<MecanismName inline name={name}>
			{name}
		</MecanismName>
	)
}

const MecanismName = ({
	name,
	inline = false,
	children,
}: {
	name: string
	inline?: boolean
	children: React.ReactNode
}) => {
	return (
		<>
			<StyledMecanismName
				name={name}
				inline={inline}
				target="_blank"
				href={`https://publi.codes/docs/mécanismes#${name}`}
			>
				{children}
			</StyledMecanismName>
		</>
	)
}

type RuleExplanationProps = {
	exemples: { base: string }
	description: string
	name: string
}

export default function RuleExplanation({
	name,
	description,
	exemples,
}: RuleExplanationProps) {
	const { Text } = useContext(RenderersContext)
	return (
		<>
			{!!name && (
				<h2 id={name}>
					<pre>{name}</pre>
				</h2>
			)}
			<Text>{description}</Text>
			{exemples && (
				<>
					{Object.entries(exemples).map(([name, exemple]) => (
						<React.Fragment key={name}>
							<h3>{name === 'base' ? 'Exemple' : capitalise0(name)}</h3>
							<Text>{`\`\`\`yaml\n${exemple}\n\`\`\``}</Text>
						</React.Fragment>
					))}
				</>
			)}
		</>
	)
}

const StyledMecanism = styled.div<{ name: string }>`
	border: 1px solid;
	max-width: 100%;
	border-radius: 3px;
	padding: 1rem;
	position: relative;
	flex: 1;
	flex-direction: column;
	text-align: left;
	border-color: ${({ name }) => mecanismColors(name)};
	.properties > li {
		margin: 1rem 0;
	}
`

const StyledMecanismName = styled.a<{ name: string; inline?: boolean }>`
	background-color: ${({ name }) => mecanismColors(name)};
	font-size: inherit;
	display: inline-block;
	font-weight: inherit;
	width: fit-content;
	font-family: inherit;
	padding: 0.4rem 0.6rem !important;
	color: white !important;
	transition: hover 0.2s;
	:hover {
		color: white;
	}
	${(props) =>
		props.inline
			? css`
					border-radius: 0.3rem;
					margin-bottom: 0.5rem;
			  `
			: css`
					top: -1rem;
					position: relative;
					margin-left: -1rem;
					border-radius: 0 !important;
					border-bottom-right-radius: 0.3rem !important;
					::first-letter {
						text-transform: capitalize;
					}
			  `}
	:hover {
		opacity: 0.8;
	}
`

export const CapitalizeFirstLetter = styled.div`
	font-weight: bold;
	:first-letter {
		text-transform: capitalize;
	}
`

// Un élément du graphe de calcul qui a une valeur interprétée (à afficher)
export function Leaf(
	node: ReferenceNode & {
		dottedName: string
	} & EvaluatedNode
) {
	const engine = useContext(EngineContext)
	const { dottedName, nodeValue, unit } = node
	const rule = engine?.getRule(node.dottedName)
	if (!rule) {
		throw new Error('Unknown node')
	}
	const [folded, setFolded] = useState(true)
	const foldButton = useContext(UnfoldIsEnabledContext) ? (
		<UnfoldButton onClick={() => setFolded(!folded)}>
			{folded ? 'déplier' : 'replier'}
		</UnfoldButton>
	) : null
	if (
		node.dottedName === node.contextDottedName + ' . ' + node.name &&
		!node.name.includes(' . ') &&
		rule.virtualRule
	) {
		return <Explanation node={engine?.evaluate(rule)} />
	}
	return (
		<div
			style={{
				display: 'inline',
				whiteSpace: 'nowrap',
				maxWidth: '100%',
				textOverflow: 'ellipsis',
			}}
		>
			<span>
				<RuleLinkWithContext dottedName={dottedName}>
					<span className="name">
						{rule.rawNode.acronyme ? (
							<abbr title={rule.title}>{rule.rawNode.acronyme}</abbr>
						) : (
							rule.title
						)}
					</span>
				</RuleLinkWithContext>
				{foldButton}

				{nodeValue !== null && unit && (
					<NodeValuePointer data={nodeValue} unit={unit} />
				)}
			</span>{' '}
			{!folded && (
				<div>
					<UnfoldIsEnabledContext.Provider value={false}>
						<Explanation node={engine?.evaluate(rule)} />
					</UnfoldIsEnabledContext.Provider>
				</div>
			)}
		</div>
	)
}

export const UnfoldIsEnabledContext = createContext<boolean>(false)

const UnfoldButton = styled.button`
	text-transform: none !important;
	flex: 1 !important;
	margin-left: 0.4rem !important;
	text-align: left !important;
`
