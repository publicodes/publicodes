import { EvaluationFunction } from '..'
import { ASTNode, Unit } from '../AST/types'
import { convertToDate, convertToString } from '../date'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode, mergeAllMissing, parseObject } from '../evaluationUtils'
import { parseUnit } from '../units'

export type DuréeNode = {
	explanation: {
		depuis: ASTNode
		"jusqu'à": ASTNode
	}
	unit: Unit
	nodeKind: 'durée'
}

const todayString = convertToString(new Date())
const objectShape = {
	depuis: defaultNode(todayString),
	"jusqu'à": defaultNode(todayString),
}
const evaluate: EvaluationFunction<'durée'> = function (node) {
	const from = this.evaluateNode(node.explanation.depuis)
	const to = this.evaluateNode(node.explanation["jusqu'à"])
	let nodeValue
	if ([from, to].some(({ nodeValue }) => nodeValue === undefined)) {
		nodeValue = undefined
	} else {
		const [fromDate, toDate] = [from.nodeValue, to.nodeValue].map(
			convertToDate as any
		)
		nodeValue = Math.max(
			0,
			Math.round(
				(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
			)
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

export default (v, context) => {
	const explanation = parseObject(objectShape, v, context)
	return {
		explanation,
		unit: parseUnit('jour'),
		nodeKind: 'durée',
	} as DuréeNode
}

registerEvaluationFunction('durée', evaluate)
