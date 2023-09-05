import { ASTNode, EvaluatedNode } from 'publicodes/source'
import { useContext } from 'react'
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
					{isChainableMecanism ? (
						<ListOrScalarExplanation node={args[mecanismName]} />
					) : isUnaryMecanism ? (
						<ListOrScalarExplanation node={args.valeur} />
					) : (
						<ul>
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
					)}
				</Mecanism>
			</div>
		</>
	)
}

function ListOrScalarExplanation({ node }: { node: ASTNode | Array<ASTNode> }) {
	if (Array.isArray(node)) {
		return <Table explanation={node} />
	}
	return <Explanation node={node} />
}

// We want to put non applicable rules a the bottom of list #1055
const isDimmedValue = (x: ASTNode) => {
	const nodeValue = useContext(EngineContext)?.evaluate(x).nodeValue
	return nodeValue === null || nodeValue === 0
}
function sortByApplicability(a: EvaluatedNode, b: EvaluatedNode): 1 | 0 | -1 {
	if (isDimmedValue(a) === isDimmedValue(b)) {
		return 0
	}
	return isDimmedValue(a) ? 1 : -1
}

const Table = ({ explanation }) => (
	<StyledContainer>
		{explanation.sort(sortByApplicability).map((node: EvaluatedNode, i) => (
			<Row key={i} node={node} />
		))}
	</StyledContainer>
)

const StyledContainer = styled.ul`
	margin: 0;
	margin-left: 0.5rem;
	list-style: circle !important;
`

/* La colonne peut au clic afficher une nouvelle colonne qui sera une autre somme imbriquée */
function Row({ node }: { node: EvaluatedNode }) {
	return (
		<StyledRow
			style={{ padding: '0.25rem 0' }}
			className={isDimmedValue(node) ? 'notApplicable' : ''}
		>
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

	&.notApplicable {
		position: relative;
		::before {
			content: ' ';
			position: absolute;
			display: block;
			background-color: white;
			pointer-events: none;
			opacity: 0.4;
			top: 0;
			z-index: 2;
			bottom: 0;
			right: 0;
			left: 0;
		}
	}
`
