import { ActionData } from '@publicodes/worker'
import { usePromise } from '@publicodes/worker-react'
import { Evaluation } from 'publicodes'
import { ASTNode, EvaluatedNode } from 'publicodes/source'
import { styled } from 'styled-components'
import Explanation from '../Explanation'
import { executeAction, getSubEngineOrEngine } from '../actions'
import { useEngine, useSubEngineId } from '../hooks/useEngine'
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

function ListOrScalarExplanation({ node }: { node: ASTNode | ASTNode[] }) {
	if (Array.isArray(node)) {
		return <Table explanation={node} />
	}
	return <Explanation node={node} />
}

// We want to put non applicable rules a the bottom of list #1055
const isDimmedValue = (nodeValue: Evaluation) =>
	nodeValue === null || nodeValue === 0

export const getSortByApplicability = (
	{ engine: baseEngine }: ActionData,
	{ explanation, subEngineId }: { explanation: ASTNode[]; subEngineId?: number }
) => {
	const engine = getSubEngineOrEngine(baseEngine, subEngineId)

	return explanation.sort((a, b) => {
		const A = isDimmedValue(engine.evaluate(a).nodeValue)
		const B = isDimmedValue(engine.evaluate(b).nodeValue)

		if (A === B) {
			return 0
		}
		return A ? 1 : -1
	})
}

const Table = ({ explanation }: { explanation: ASTNode[] }) => {
	const engine = useEngine()
	const subEngineId = useSubEngineId()

	const sortedExplanation = usePromise(
		() =>
			executeAction(engine, 'getSortByApplicability', {
				explanation,
				subEngineId,
			}),
		[engine, subEngineId, explanation],
		[]
	)

	return (
		<StyledContainer>
			{sortedExplanation.map((node: ASTNode, i) => (
				<Row key={i} node={node as EvaluatedNode} />
			))}
		</StyledContainer>
	)
}

const StyledContainer = styled.ul`
	margin: 0;
	margin-left: 0.5rem;
	list-style: circle !important;
`

export const getIsDimmedValue = (
	{ engine: baseEngine }: ActionData,
	{ node, subEngineId }: { node: ASTNode; subEngineId?: number }
) => {
	const engine = getSubEngineOrEngine(baseEngine, subEngineId)

	return isDimmedValue(engine.evaluate(node).nodeValue)
}

/* La colonne peut au clic afficher une nouvelle colonne qui sera une autre somme imbriquée */
function Row({ node }: { node: EvaluatedNode }) {
	const engine = useEngine()
	const subEngineId = useSubEngineId()

	const isDimmedValue = usePromise(
		() => executeAction(engine, 'getIsDimmedValue', { node, subEngineId }),
		[engine, subEngineId, node]
	)

	return (
		<StyledRow
			style={{ padding: '0.25rem 0' }}
			className={isDimmedValue ? 'notApplicable' : ''}
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
