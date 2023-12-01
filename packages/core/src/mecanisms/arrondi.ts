import { EvaluationFunction, simplifyNodeUnit } from '..'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { PublicodesError } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import { serializeUnit } from '../units'

export type ArrondiNode = {
	explanation: {
		arrondi: ASTNode
		valeur: ASTNode
	}
	nodeKind: 'arrondi'
}

function roundWithPrecision(n: number, fractionDigits: number) {
	return +n.toFixed(fractionDigits)
}

const evaluate: EvaluationFunction<'arrondi'> = function (node) {
	// We need to simplify the node unit to correctly round values containing
	// percentages units, see #1358
	const valeur = simplifyNodeUnit(this.evaluateNode(node.explanation.valeur))
	const nodeValue = valeur.nodeValue
	let arrondi = node.explanation.arrondi
	if (nodeValue !== false) {
		arrondi = this.evaluateNode(arrondi)

		if (
			typeof (arrondi as EvaluatedNode).nodeValue === 'number' &&
			!serializeUnit((arrondi as EvaluatedNode).unit)?.match(/décimales?/)
		) {
			throw new PublicodesError(
				'EvaluationError',
				`L'unité ${serializeUnit(
					(arrondi as EvaluatedNode).unit
				)} de l'arrondi est inconnu. Vous devez utiliser l'unité “décimales”`,
				{ dottedName: this.cache._meta.evaluationRuleStack[0] }
			)
		}
	}

	return {
		...node,
		nodeValue:
			typeof valeur.nodeValue !== 'number' || !('nodeValue' in arrondi)
				? valeur.nodeValue
				: typeof arrondi.nodeValue === 'number'
				? roundWithPrecision(valeur.nodeValue, arrondi.nodeValue)
				: arrondi.nodeValue === true
				? roundWithPrecision(valeur.nodeValue, 0)
				: arrondi.nodeValue === undefined
				? undefined
				: valeur.nodeValue,
		explanation: { valeur, arrondi },
		missingVariables: mergeAllMissing([valeur, arrondi]),
		unit: valeur.unit,
	}
}

export default function parseArrondi(v, context) {
	const explanation = {
		valeur: parse(v.valeur, context),
		arrondi: parse(v.arrondi, context),
	}
	return {
		explanation,
		nodeKind: parseArrondi.nom,
	}
}

parseArrondi.nom = 'arrondi' as const

registerEvaluationFunction(parseArrondi.nom, evaluate)
