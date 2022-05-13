import { ASTNode, EvaluatedNode } from '../AST/types'
import { mergeAllMissing } from '../evaluation'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

export type SituationNode = {
	explanation: {
		situationKey: string
		valeur: ASTNode
		isNullable: true | undefined
		defaultType: 'string' | 'boolean' | 'number'
		situationValeur?: ASTNode
	}
	nodeKind: 'dans la situation'
}
export default function parseSituation(v, context) {
	const explanation = {
		situationKey: v[parseSituation.nom].clé,
		isNullable:
			v[parseSituation.nom]['possiblement non applicable'] === 'oui'
				? true
				: undefined,
		defaultType: v[parseSituation.nom]['type par défaut'],
		valeur: parse(v.valeur, context),
	}
	return {
		nodeKind: parseSituation.nom,
		explanation,
	} as SituationNode
}

parseSituation.nom = 'dans la situation' as const

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
	const missingVariables = mergeAllMissing(
		[explanation.situationValeur, explanation.valeur].filter(
			Boolean
		) as Array<EvaluatedNode>
	)

	return {
		...node,
		nodeValue: valeur.nodeValue,
		...(unit !== undefined && { unit }),
		explanation,
		missingVariables:
			Object.keys(missingVariables).length === 0 &&
			valeur.nodeValue === undefined
				? { [situationKey]: 1 }
				: missingVariables,
	}
})
