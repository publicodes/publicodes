import { ASTNode, PublicodesExpression } from '..'
import {
	createParseInlinedMecanismWithArray,
	notApplicableNode,
} from './inlineMecanism'
import { reduceToSumNodes } from './somme'

export default createParseInlinedMecanismWithArray(
	'moyenne',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => {
		const valeurs = [...(valeur as Array<PublicodesExpression>)]

		return {
			'/': [
				reduceToSumNodes(valeurs),
				reduceToSumNodes(
					// To only count the applicable nodes
					valeurs.map((val) => changeTheNodeToOne(val as ASTNode))
				),
			],
		}
	}
)

function changeTheNodeToOne(value: ASTNode): ASTNode {
	switch (value.nodeKind) {
		case 'reference':
		case 'constant':
			return value.rawNode == null
				? value
				: {
						nodeKind: 'constant',
						nodeValue: 1,
						type: 'number',
				  }
		case 'unité':
			return {
				...value,
				explanation: changeTheNodeToOne(value.explanation),
				unit: { numerators: [], denominators: [] },
			}
		case 'condition': {
			return {
				...value,
				explanation: {
					...value.explanation,
					alors: changeTheNodeToOne(value.explanation.alors),
					sinon: changeTheNodeToOne(value.explanation.sinon),
				},
			}
		}
		case 'variations': {
			return {
				...value,
				explanation: value.explanation.map((v) => ({
					...v,
					consequence: changeTheNodeToOne(v.consequence),
				})),
			}
		}
		default:
			return value
	}
}
