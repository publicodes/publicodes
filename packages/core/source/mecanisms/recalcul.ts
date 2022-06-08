import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { ReferenceNode } from '../reference'
import { serializeUnit } from '../units'
import { notApplicableNode } from './inlineMecanism'

export type RecalculNode = {
	explanation: {
		recalculNode: ASTNode
		amendedSituation: Array<[ReferenceNode, ASTNode]>
		subEngineId: number
	}
	nodeKind: 'recalcul'
}

const evaluateRecalcul: EvaluationFunction<'recalcul'> = function (node) {
	if (this.cache._meta.currentRecalcul === node.explanation.recalculNode) {
		return { ...notApplicableNode, ...node }
	}
	const amendedSituation = Object.fromEntries(
		node.explanation.amendedSituation
			.filter(([originRule, replacement]) => {
				const originRuleEvaluation = this.evaluateNode(originRule)
				const replacementEvaluation = this.evaluateNode(replacement)

				return (
					originRuleEvaluation.nodeValue !== replacementEvaluation.nodeValue ||
					serializeUnit(originRuleEvaluation.unit) !==
						serializeUnit(replacementEvaluation.unit)
				)
			})
			.map(([originRule, replacement]) => [originRule.dottedName, replacement])
	)

	let engine = this
	if (Object.keys(amendedSituation).length) {
		engine = this.shallowCopy().setSituation(amendedSituation, {
			keepPreviousSituation: true,
		})
		engine.subEngineId = this.subEngines.length
		this.subEngines.push(engine)
	}
	engine.cache._meta.currentRecalcul = node.explanation.recalculNode
	const evaluatedNode = engine.evaluateNode(node.explanation.recalculNode)

	delete engine.cache._meta.currentRecalcul

	return {
		...node,
		nodeValue: evaluatedNode.nodeValue,
		explanation: {
			...node.explanation,
			recalcul: evaluatedNode,
			subEngineId: engine.subEngineId as number,
		},
		missingVariables: evaluatedNode.missingVariables,
		...('unit' in evaluatedNode && { unit: evaluatedNode.unit }),
	}
}

export const mecanismRecalcul = (v, context) => {
	const amendedSituation = Object.keys(v.avec).map((dottedName) => [
		parse(dottedName, context),
		parse(v.avec[dottedName], context),
	])

	const recalculNode = parse(v.règle ?? context.dottedName, context)

	return {
		explanation: {
			recalculNode,
			amendedSituation,
		},
		nodeKind: 'recalcul',
	} as RecalculNode
}

registerEvaluationFunction('recalcul', evaluateRecalcul)
