import { EvaluationFunction, PublicodesError } from '..'
import { ASTNode, Evaluation, Unit } from '../AST/types'
import {
	convertToString,
	getDifferenceInDays,
	getDifferenceInMonths,
	getDifferenceInTrimestreCivils,
	getDifferenceInYears,
	getDifferenceInYearsCivil,
} from '../date'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode, mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import { parseUnit } from '../units'

export type DuréeNode = {
	explanation: {
		depuis: ASTNode
		"jusqu'à": ASTNode
	}
	unit: Unit
	nodeKind: 'durée'
}
const evaluate: EvaluationFunction<'durée'> = function (node) {
	const fromNode = this.evaluateNode(node.explanation.depuis)
	const toNode = this.evaluateNode(node.explanation["jusqu'à"])

	const from = fromNode.nodeValue as Evaluation<string>
	const to = toNode.nodeValue as Evaluation<string>

	let nodeValue: Evaluation<number>
	if (from === null || to === null) {
		nodeValue = null
	} else if (from === undefined || to === undefined) {
		nodeValue = undefined
	} else {
		switch (node.unit.numerators[0] as PossibleUnit) {
			case 'jour':
				nodeValue = getDifferenceInDays(from, to)
				break
			case 'mois':
				nodeValue = getDifferenceInMonths(from, to)
				break
			case 'an':
				nodeValue = getDifferenceInYears(from, to)
				break
			case 'trimestre':
				nodeValue = getDifferenceInMonths(from, to) / 3
				break
			case 'trimestre civil':
				nodeValue = getDifferenceInTrimestreCivils(from, to)
				break
			case 'année civile':
				nodeValue = getDifferenceInYearsCivil(from, to)
				break
		}
	}

	if (typeof nodeValue === 'number') {
		nodeValue = Math.max(0, nodeValue)
	}

	return {
		...node,
		missingVariables: mergeAllMissing([fromNode, toNode]),
		nodeValue,
		explanation: {
			depuis: fromNode,
			"jusqu'à": toNode,
		},
	}
}

const today = defaultNode(convertToString(new Date()))
export default (v, context) => {
	const explanation = {
		depuis: parse(v.depuis ?? today, context),
		"jusqu'à": parse(v["jusqu'à"] ?? today, context),
	}
	const unit = v.unité ? parseUnit(v.unité) : parseUnit('jour')
	if (
		unit.denominators.length > 0 ||
		unit.numerators.length > 1 ||
		!possibleUnit.includes(unit.numerators[0] as PossibleUnit)
	) {
		throw new PublicodesError(
			'SyntaxError',
			`Seules les unités suivantes sont acceptées pour une durée : ${possibleUnit.join(
				', ',
			)}.
	L'unité fournie est: ${unit.numerators[0]}`,
			{
				dottedName: context.dottedName,
			},
		)
	}
	return {
		explanation,
		unit,
		nodeKind: 'durée',
	} as DuréeNode
}

registerEvaluationFunction('durée', evaluate)

type PossibleUnit = (typeof possibleUnit)[number]
const possibleUnit = [
	'mois',
	'jour',
	'an',
	'trimestre',
	'trimestre civil',
	'année civile',
] as const
