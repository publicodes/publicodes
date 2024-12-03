import { ASTNode, transformAST } from 'publicodes'
import { useEngine } from './hooks'
import Arrondi from './mecanisms/Arrondi'
import Barème from './mecanisms/Barème'
import Condition from './mecanisms/Condition'
import Constant from './mecanisms/Constant'
import Contexte from './mecanisms/Contexte'
import Durée from './mecanisms/Durée'
import EstNonApplicable from './mecanisms/EstNonApplicable'
import EstNonDéfini from './mecanisms/EstNonDéfini'
import Grille from './mecanisms/Grille'
import InversionNumérique from './mecanisms/InversionNumérique'
import Operation from './mecanisms/Operation'
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
import DefaultInlineMecanism from './mecanisms/common/DefaultInlineMecanism'

const UIComponents = {
	constant: Constant,
	arrondi: Arrondi,
	barème: Barème,
	durée: Durée,
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
	contexte: Contexte,
	replacement: Replacement,
	replacementRule: ReplacementRule,
	'taux progressif': TauxProgressif,
	'une possibilité': UnePossibilité,
	'résoudre référence circulaire': RésoudreRéférenceCirculaire,
	unité: Unité,
	'variable manquante': (node: ASTNode<'variable manquante'>) => (
		<Explanation node={node.explanation} />
	),
	variations: Variations,
} as const

/**
 * Display the documentation of a parsed publicodes AST node
 *
 * @param props
 * @param props.node - The AST node to display
 * @group Components
 *
 */
export default function Explanation({ node }: { node: ASTNode }) {
	const visualisationKind = node.sourceMap?.mecanismName ?? node.nodeKind
	const engine = useEngine()
	const evaluateEverything = transformAST((node) => {
		if ('nodeValue' in node || 'replacementRule' === node.nodeKind) {
			return false
		}

		return engine.evaluateNode(node)
	}, false)
	const displayedNode = evaluateEverything(node)
	const Component: any =
		UIComponents[visualisationKind as keyof typeof UIComponents] ??
		(node.sourceMap?.mecanismName ? DefaultInlineMecanism : undefined)

	if (!Component) {
		throw new Error(`Unknown visualisation: ${visualisationKind}`)
	}

	return <Component {...displayedNode} />
}
