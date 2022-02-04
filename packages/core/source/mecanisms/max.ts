import { ASTNode } from '../AST/types'
import { evaluateArray } from '../evaluation'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

export type MaxNode = {
	explanation: Array<ASTNode>
	nodeKind: 'maximum'
}

export const mecanismMax = (v, context) => {
	const explanation = v.map((node) => parse(node, context))

	return {
		explanation,
		nodeKind: 'maximum',
	} as MaxNode
}

const max = (a, b) => {
	if (a === null) {
		return b
	}
	if (b === null) {
		return a
	}
	if (a === undefined || b === undefined) {
		return undefined
	}
	return Math.max(a, b)
}
const evaluate = evaluateArray<'maximum'>(max, null)
registerEvaluationFunction('maximum', evaluate)
