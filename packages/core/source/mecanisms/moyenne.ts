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
		const denominator = valeurs.reverse().reduce((acc, v) => {
			const one = changeTheValueToOne(v as ASTNode)
			// console.log('one:', (one as any).explanation.alors)
			return { '+': [one, acc] }
		}, notApplicableNode)
		const numerator = valeurs
			.reverse()
			.reduce((acc, value) => ({ '+': [value, acc] }), notApplicableNode)

		return { '/': [numerator, denominator] }
	}
)

function changeTheValueToOne(value: ASTNode): PublicodesExpression {
	switch (value.nodeKind) {
		case 'reference':
			return { ...value, nodeValue: 1 }
		case 'constant':
			return { ...value, nodeValue: 1, type: 'number' }
		case 'unité':
			return { ...value, explanation: changeTheValueToOne(value.explanation) }
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
