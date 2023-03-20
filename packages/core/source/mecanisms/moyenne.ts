import { ASTNode, PublicodesExpression } from '..'
import {
	createParseInlinedMecanismWithArray,
	notApplicableNode,
} from './inlineMecanism'

export default createParseInlinedMecanismWithArray(
	'moyenne',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => {
		const valeurs = [...(valeur as Array<PublicodesExpression>)]
		if (valeurs.length === 0) {
			return notApplicableNode
		}
		const denominator = valeurs
			.reverse()
			.reduce(
				(acc, v) => ({ '+': [changeTheValueToOne(v as ASTNode), acc] }),
				notApplicableNode
			)
		const numerator = valeurs
			.reverse()
			.reduce((acc, value) => ({ '+': [value, acc] }), notApplicableNode)

		return { '/': [numerator, denominator] }
	}
)

function changeTheValueToOne(value: ASTNode): PublicodesExpression {
	switch (value.nodeKind) {
		case 'reference':
		case 'constant':
			return { ...value, nodeValue: 1, type: 'number' }
		case 'unité':
			return {
				...value,
				explanation: changeTheValueToOne(value.explanation),
				unit: { numerators: [], denominators: [] },
			}
		case 'condition': {
			return {
				...value,
				explanation: {
					...value.explanation,
					alors: changeTheValueToOne(value.explanation.alors),
				},
			}
		}

		default:
			return value
	}
}
