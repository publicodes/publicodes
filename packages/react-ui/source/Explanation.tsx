import { ActionData } from '@publicodes/worker'
import { usePromise } from '@publicodes/worker-react'
import { ASTNode, transformAST } from 'publicodes'
import { executeAction, getSubEngineOrEngine } from './actions'
import { useEngine, useSubEngineId } from './hooks/useEngine'
import Arrondi from './mecanisms/Arrondi'
import Avec from './mecanisms/Avec'
import Barème from './mecanisms/Barème'
import Composantes from './mecanisms/Composantes'
import Condition from './mecanisms/Condition'
import DefaultInlineMecanism from './mecanisms/DefaultInlineMecanism'
import Durée from './mecanisms/Durée'
import EstNonApplicable from './mecanisms/EstNonApplicable'
import EstNonDéfini from './mecanisms/EstNonDéfini'
import Grille from './mecanisms/Grille'
import InversionNumérique from './mecanisms/InversionNumérique'
import Operation from './mecanisms/Operation'
import Product from './mecanisms/Product'
import Recalcul from './mecanisms/Recalcul'
import Reference from './mecanisms/Reference'
import Replacement from './mecanisms/Replacement'
import ReplacementRule from './mecanisms/ReplacementRule'
import Rule from './mecanisms/Rule'
import RésoudreRéférenceCirculaire from './mecanisms/RésoudreRéférenceCirculaire'
import Situation from './mecanisms/Situation'
import TauxProgressif from './mecanisms/TauxProgressif'
import Texte from './mecanisms/Texte'
import UnePossibilité from './mecanisms/UnePossibilité'
import Unité from './mecanisms/Unité'
import Variations from './mecanisms/Variations'
import { ConstantNode } from './mecanisms/common'

const UIComponents = {
	constant: ConstantNode,
	arrondi: Arrondi,
	barème: Barème,
	avec: Avec,
	composantes: Composantes,
	durée: Durée,
	produit: Product,
	grille: Grille,
	inversion: InversionNumérique,
	operation: Operation,
	texte: Texte,
	reference: Reference,
	'est non applicable': EstNonApplicable,
	'est non défini': EstNonDéfini,
	rule: Rule,
	condition: Condition,
	'dans la situation': Situation,
	recalcul: Recalcul,
	replacement: Replacement,
	replacementRule: ReplacementRule,
	'taux progressif': TauxProgressif,
	'une possibilité': UnePossibilité,
	'résoudre référence circulaire': RésoudreRéférenceCirculaire,
	unité: Unité,
	'variable manquante': (node) => <Explanation node={node.explanation} />,
	variations: Variations,
} as const

export default function Explanation({ node }) {
	const visualisationKind = node.sourceMap?.mecanismName ?? node.nodeKind
	const engine = useEngine()
	const subEngineId = useSubEngineId()

	const { displayedNode, Component } =
		usePromise(async () => {
			const displayedNode = await executeAction(engine, 'getExplanationData', {
				node,
				subEngineId,
			})
			const Component =
				UIComponents[visualisationKind] ??
				(node.sourceMap?.mecanismName ? DefaultInlineMecanism : undefined)

			return { displayedNode, Component }
		}, [engine, node, subEngineId, visualisationKind]) ?? {}

	if (displayedNode === undefined) {
		return <>loading....</>
	}

	if (!Component) {
		throw new Error(`Unknown visualisation: ${visualisationKind}`)
	}

	return <Component {...displayedNode} />
}

export const getExplanationData = (
	{ engine: baseEngine }: ActionData,
	{ node, subEngineId }: { node: ASTNode; subEngineId?: number }
) => {
	const engine = getSubEngineOrEngine(baseEngine, subEngineId)

	const evaluateEverything = transformAST((node) => {
		if ('nodeValue' in node || 'replacementRule' === node.nodeKind) {
			return false
		}

		return engine.evaluateNode(node)
	}, false)
	const displayedNode = evaluateEverything(node)

	return displayedNode
}
