import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

export type TouteCesConditionsNode = {
	explanation: Array<ASTNode>
	nodeKind: 'toutes ces conditions'
}

const evaluate: EvaluationFunction<'toutes ces conditions'> = function (node) {
	const [nodeValue, explanation] = node.explanation.reduce<
		[boolean | undefined, Array<ASTNode>]
	>(
		([nodeValue, explanation], node) => {
			if (nodeValue === false) {
				return [nodeValue, [...explanation, node]]
			}
			const evaluatedNode = this.evaluate(node)
			return [
				nodeValue === undefined || evaluatedNode.nodeValue === undefined
					? undefined
					: !!evaluatedNode.nodeValue,
				[...explanation, evaluatedNode],
			]
		},
		[true, []]
	)

	return {
		...node,
		nodeValue,
		explanation,
	}
}

export const mecanismAllOf = (v, context) => {
	if (!Array.isArray(v)) throw new Error('should be array')
	const explanation = v.map((node) => parse(node, context))

	return {
		explanation,
		nodeKind: 'toutes ces conditions',
	}
}

registerEvaluationFunction('toutes ces conditions', evaluate)
