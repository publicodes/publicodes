import { EvaluationFunction } from '..'
import { ASTNode, EvaluatedNode, Evaluation } from '../AST/types'
import { InternalError } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

export type UneDeCesConditionsNode = {
	explanation: Array<ASTNode>
	nodeKind: 'une de ces conditions'
}

const evaluate: EvaluationFunction<'une de ces conditions'> = function (node) {
	type Calculations = {
		explanation: Array<ASTNode | EvaluatedNode>
		nodeValue: Evaluation<boolean>
	}
	const calculations = node.explanation.reduce<Calculations>(
		(acc, node) => {
			if (acc.nodeValue === true) {
				return {
					...acc,
					explanation: [...acc.explanation, node],
				}
			}
			if (acc.nodeValue === undefined || acc.nodeValue === false) {
				const evaluatedNode = this.evaluate(node)
				return {
					nodeValue: evaluatedNode.nodeValue
						? true
						: evaluatedNode.nodeValue === undefined
						? undefined
						: acc.nodeValue,
					explanation: [...acc.explanation, evaluatedNode],
				}
			}
			throw new InternalError([node, acc])
		},
		{
			nodeValue: false,
			explanation: [],
		}
	)
	return {
		...node,
		...calculations,
	}
}

export const mecanismOneOf = (v, context) => {
	if (!Array.isArray(v)) throw new Error('should be array')
	const explanation = v.map((node) => parse(node, context))

	return {
		explanation,
		nodeKind: 'une de ces conditions',
	}
}

registerEvaluationFunction('une de ces conditions', evaluate)
