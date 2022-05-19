import { transformAST } from 'publicodes'
import { useContext } from 'react'
import { EngineContext } from './contexts'
import Arrondi from './mecanisms/Arrondi'
import Barème from './mecanisms/Barème'
import { ConstantNode } from './mecanisms/common'
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
import Synchronisation from './mecanisms/Synchronisation'
import TauxProgressif from './mecanisms/TauxProgressif'
import Texte from './mecanisms/Texte'
import UnePossibilité from './mecanisms/UnePossibilité'
import Unité from './mecanisms/Unité'
import Variations from './mecanisms/Variations'

const UIComponents = {
	constant: ConstantNode,
	arrondi: Arrondi,
	barème: Barème,
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
	synchronisation: Synchronisation,
	recalcul: Recalcul,
	replacement: Replacement,
	replacementRule: ReplacementRule,
	'taux progressif': TauxProgressif,
	'une possibilité': UnePossibilité,
	'résoudre référence circulaire': RésoudreRéférenceCirculaire,
	unité: Unité,
	variations: Variations,
} as const

export default function Explanation({ node }) {
	const visualisationKind = node.sourceMap?.mecanismName ?? node.nodeKind
	const engine = useContext(EngineContext)
	if (!engine) {
		throw new Error('We need an engine instance in the React context')
	}
	const evaluateEverything = transformAST((node) => {
		if ('nodeValue' in node || 'replacementRule' === node.nodeKind) {
			return false
		}

		return engine.evaluate(node)
	}, false)
	const displayedNode = evaluateEverything(node)
	const Component =
		UIComponents[visualisationKind] ??
		(node.sourceMap?.mecanismName ? DefaultInlineMecanism : undefined)
	if (!Component) {
		throw new Error(`Unknown visualisation: ${visualisationKind}`)
	}
	return <Component {...displayedNode} />
}
