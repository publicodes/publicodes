import { ASTNode, EvaluatedNode, isNotYetDefined } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

export type SituationNode = {
	explanation: {
		situationKey: string
		valeur: ASTNode
		situationValeur?: ASTNode
	}
	nodeKind: 'nom dans la situation'
}
export default function parseSituation(v, context) {
	const explanation = {
		situationKey: v[parseSituation.nom],
		valeur: parse(v.valeur, context),
	}
	return {
		nodeKind: parseSituation.nom,
		explanation,
	} as SituationNode
}

parseSituation.nom = 'nom dans la situation' as const

registerEvaluationFunction(parseSituation.nom, function evaluate(node) {
	const explanation = { ...node.explanation }
	const situationKey = explanation.situationKey
	let valeur: EvaluatedNode
	if (situationKey in this.parsedSituation) {
		valeur = this.evaluate(this.parsedSituation[situationKey])
		explanation.situationValeur = valeur
	} else {
		valeur = this.evaluate(explanation.valeur)
		explanation.valeur = valeur
		delete explanation.situationValeur
	}

	const unit =
		valeur.unit ??
		('unit' in explanation.valeur ? explanation.valeur.unit : undefined)
	return {
		...node,
		nodeValue: valeur.nodeValue,
		...(unit !== undefined && { unit }),
		explanation,
	}
})
