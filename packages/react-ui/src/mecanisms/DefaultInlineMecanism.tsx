import { ASTNode, EvaluatedNode } from 'publicodes'
import { useContext, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { EngineContext } from '../contexts'
import { UnfoldIsEnabledContext } from './Reference'
import { Mecanism } from './common'

export default function DefaultInlineMecanism({
	sourceMap,
	nodeValue,
	unit,
}: EvaluatedNode & {
	sourceMap: NonNullable<EvaluatedNode['sourceMap']>
}) {
	const { args, mecanismName } = sourceMap

	const isChainableMecanism =
		'valeur' in args && mecanismName in args && Object.keys(args).length === 2
	const isUnaryMecanism = 'valeur' in args && Object.keys(args).length === 1

	return (
		<>
			{isChainableMecanism && <ListOrScalarExplanation node={args.valeur} />}
			<div style={{ paddingTop: '0.5rem' }}>
				<Mecanism name={mecanismName} value={nodeValue} unit={unit}>
					{isChainableMecanism ?
						<ListOrScalarExplanation node={args[mecanismName]} />
					: isUnaryMecanism ?
						<ListOrScalarExplanation
							node={args.valeur}
							hideNotApplicable={mecanismName !== 'produit'}
						/>
					:	<ul>
							{Object.entries(args).map(([key, value]) => (
								<li
									key={key}
									style={{
										display: 'flex',
										alignItems: 'baseline',
										padding: '0.25rem 0',
									}}
								>
									<span>{key}&nbsp;:&nbsp;</span>
									<span>
										<ListOrScalarExplanation node={value} />
									</span>
								</li>
							))}
						</ul>
					}
				</Mecanism>
			</div>
		</>
	)
}

function ListOrScalarExplanation({
	node,
	hideNotApplicable,
}: {
	node: ASTNode | Array<ASTNode>
	hideNotApplicable?: boolean
}) {
	if (Array.isArray(node)) {
		return <Table explanation={node} hideNotApplicable={hideNotApplicable} />
	}
	return <Explanation node={node} />
}

// We want to put non applicable rules a the bottom of list #1055
const isZeroOrNotApplicable = (x: ASTNode) => {
	const nodeValue = useContext(EngineContext)?.evaluate(x).nodeValue
	return nodeValue === null || nodeValue === 0
}

function Table({ explanation, hideNotApplicable = true }) {
	const [applicableExplanation, notApplicableExplanation] = explanation.reduce(
		(acc, x) => {
			acc[hideNotApplicable && isZeroOrNotApplicable(x) ? 1 : 0].push(x)
			return acc
		},
		[[], []],
	)
	const [showNotApplicable, setShowNotApplicable] = useState(
		applicableExplanation.length === 0,
	)
	const id = useMemo(
		() => 'notApplicableExplanation' + Math.random().toString(36).substring(7),
		[],
	)
	return (
		<>
			<StyledContainer>
				{applicableExplanation.map((node: EvaluatedNode, i) => (
					<Row key={i} node={node} />
				))}
			</StyledContainer>
			{notApplicableExplanation.length > 0 &&
				applicableExplanation.length !== 0 && (
					<StyledButtonContainer
						css={`
							text-align: center;
						`}
					>
						<button
							aria-expanded={showNotApplicable}
							aria-controls={id}
							onClick={() => setShowNotApplicable(!showNotApplicable)}
						>
							{showNotApplicable ?
								'Cacher les valeurs non applicables'
							:	`Afficher les valeurs non applicables`}
						</button>
					</StyledButtonContainer>
				)}
			{showNotApplicable && (
				<StyledContainer id={id}>
					{notApplicableExplanation.map((node: EvaluatedNode, i) => (
						<Row key={i} node={node} />
					))}
				</StyledContainer>
			)}
		</>
	)
}
const StyledButtonContainer = styled.div`
	margin: 0.5rem 0;
	margin-left: 1.5rem;
`
const StyledContainer = styled.ul`
	margin: 0;
	margin-left: 0.5rem;
	list-style: disc !important;
`

/* La colonne peut au clic afficher une nouvelle colonne qui sera une autre somme imbriquée */
function Row({ node }: { node: EvaluatedNode }) {
	return (
		<StyledRow style={{ padding: '0.25rem 0' }}>
			<UnfoldIsEnabledContext.Provider value={true}>
				<Explanation node={node} />
			</UnfoldIsEnabledContext.Provider>
		</StyledRow>
	)
}

const StyledRow = styled.li`
	> * {
		width: 100%;
	}
`
