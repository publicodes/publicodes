import { EvaluationFunction } from '..'
import { ASTNode, Unit } from '../AST/types'
import { convertToDate, convertToString } from '../date'
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
	const from = this.evaluateNode(node.explanation.depuis)
	const to = this.evaluateNode(node.explanation["jusqu'à"])
	let nodeValue
	if ([from, to].some(({ nodeValue }) => nodeValue === undefined)) {
		nodeValue = undefined
	} else {
		const [fromDate, toDate] = ([from.nodeValue, to.nodeValue] as string[]).map(
			convertToDate,
		)
		nodeValue = Math.max(
			0,
			Math.round(
				(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
			),
		)
	}
	return {
		...node,
		missingVariables: mergeAllMissing([from, to]),
		nodeValue,
		explanation: {
			depuis: from,
			"jusqu'à": to,
		},
	}
}

const today = defaultNode(convertToString(new Date()))
export default (v, context) => {
	const explanation = {
		depuis: parse(v.depuis ?? today, context),
		"jusqu'à": parse(v["jusqu'à"] ?? today, context),
	}
	return {
		explanation,
		unit: parseUnit('jour'),
		nodeKind: 'durée',
	} as DuréeNode
}

registerEvaluationFunction('durée', evaluate)
