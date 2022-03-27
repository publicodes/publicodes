import { EvaluationFunction } from '..'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

export type ParDéfautNode = {
	explanation: {
		valeur: ASTNode
		parDéfaut: ASTNode
	}
	nodeKind: 'par défaut'
}

const evaluate: EvaluationFunction<'par défaut'> = function (node) {
	const explanation: {
		parDéfaut: EvaluatedNode | ASTNode
		valeur: EvaluatedNode | ASTNode
	} = { ...node.explanation }
	let valeur = this.evaluate(explanation.valeur)
	explanation.valeur = valeur
	if (valeur.nodeValue === undefined) {
		valeur = this.evaluate(explanation.parDéfaut)
		explanation.parDéfaut = valeur
	}

	return {
		...node,
		nodeValue: valeur.nodeValue,
		explanation,
		...('unit' in valeur && { unit: valeur.unit }),
	}
}

export default function parseParDéfaut(v, context) {
	const explanation = {
		valeur: parse(v.valeur, context),
		parDéfaut: parse(v['par défaut'], context),
	}
	return {
		explanation,
		nodeKind: parseParDéfaut.nom,
	} as ParDéfautNode
}

parseParDéfaut.nom = 'par défaut' as const

registerEvaluationFunction(parseParDéfaut.nom, evaluate)
