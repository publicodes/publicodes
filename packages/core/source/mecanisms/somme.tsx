import { PublicodesExpression } from '..'
import {
	createParseInlinedMecanismWithArray,
	notApplicableNode,
} from './inlineMecanism'

export default createParseInlinedMecanismWithArray(
	'somme',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		[...(valeur as Array<PublicodesExpression>)]
			.reverse()
			.reduce((acc, value) => ({ '+': [value, acc] }), notApplicableNode)
)
