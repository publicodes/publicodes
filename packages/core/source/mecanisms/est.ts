import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { createParseInlinedMecanism } from './utils'

export type EstNonApplicableNode = {
	explanation: ASTNode
	nodeKind: 'est non applicable'
}

export type EstNonDéfiniNode = {
	explanation: ASTNode
	nodeKind: 'est non défini'
}

export function parseEstNonApplicable(v, context) {
	const explanation = parse(v, context)
	return {
		explanation,
		nodeKind: 'est non applicable',
	} as EstNonApplicableNode
}
parseEstNonApplicable.nom = 'est non applicable'

export function parseEstNonDéfini(v, context) {
	const explanation = parse(v, context)
	return {
		explanation,
		nodeKind: 'est non défini',
	} as EstNonDéfiniNode
}
parseEstNonDéfini.nom = 'est non défini'

const parseEstDéfini = createParseInlinedMecanism(
	'est défini',
	{
		valeur: {},
	},
	{
		'=': [{ 'est non défini': 'valeur' }, 'non'],
	}
)

const parseEstApplicable = createParseInlinedMecanism(
	'est applicable',
	{
		valeur: {},
	},
	{
		'=': [{ 'est non applicable': 'valeur' }, 'non'],
	}
)

export { parseEstDéfini, parseEstApplicable }

const evaluate: EvaluationFunction<'est non applicable' | 'est non défini'> =
	function (node) {
		const valeur = this.evaluate(node.explanation)
		let nodeValue: boolean | undefined | null = false
		if (valeur.nodeValue === undefined && node.nodeKind === 'est non défini') {
			console.log('zoobs')
			nodeValue = true
		}
		if (node.nodeKind === 'est non applicable') {
			if (valeur.nodeValue === undefined) {
				nodeValue = undefined
			}
			if (valeur.nodeValue === null) {
				nodeValue = true
			}
		}

		return {
			...node,
			nodeValue,
			missingVariables: valeur.missingVariables,
			explanation: valeur,
		}
	}

registerEvaluationFunction('est non applicable', evaluate)
registerEvaluationFunction('est non défini', evaluate)
