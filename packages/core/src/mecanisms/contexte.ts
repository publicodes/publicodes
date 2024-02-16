import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { notApplicableNode } from '../evaluationUtils'
import parse from '../parse'
import { ReferenceNode } from '../reference'
import { serializeUnit } from '../units'

export type ContextNode = {
	explanation: {
		valeur: ASTNode
		contexte: Array<[ReferenceNode, ASTNode]>
		subEngineId: number
	}
	nodeKind: 'contexte'
}

export default function parseMecanismContexte(v, context) {
	const contexte = Object.keys(v.contexte).map((dottedName) => [
		parse(dottedName, context),
		parse(v.contexte[dottedName], context),
	])

	const node = parse(v.valeur, context)

	return {
		explanation: {
			valeur: node,
			contexte,
			subEngineId: context.subEngineIncrementingNumber++,
		},
		nodeKind: parseMecanismContexte.nom,
	} as ContextNode
}
parseMecanismContexte.nom = 'contexte' as const

const evaluateContexte: EvaluationFunction<'contexte'> = function (node) {
	if (
		this.cache._meta.currentEvaluationWithContext === node.explanation.valeur
	) {
		return { ...notApplicableNode, ...node }
	}
	const amendedSituation = Object.fromEntries(
		node.explanation.contexte
			.filter(([originRule, replacement]) => {
				const originRuleEvaluation = this.evaluateNode(originRule)
				const replacementEvaluation = this.evaluateNode(replacement)

				return (
					originRuleEvaluation.nodeValue !== replacementEvaluation.nodeValue ||
					serializeUnit(originRuleEvaluation.unit) !==
						serializeUnit(replacementEvaluation.unit)
				)
			})
			.map(
				([originRule, replacement]) =>
					[originRule.dottedName, replacement] as [string, ASTNode],
			),
	)

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	let engine = this
	if (Object.keys(amendedSituation).length) {
		engine = this.shallowCopy().setSituation(amendedSituation, {
			keepPreviousSituation: true,
		})
		engine.subEngineId = node.explanation.subEngineId

		// The value of the replaced ruled are computed **without the replacement active**
		Object.values(amendedSituation).forEach((value) =>
			engine.cache.nodes.set(value, this.evaluate(value)),
		)

		this.subEngines[node.explanation.subEngineId] = engine
	}
	engine.cache._meta.currentEvaluationWithContext = node.explanation.valeur
	const evaluatedNode = engine.evaluateNode(node.explanation.valeur)

	delete engine.cache._meta.currentEvaluationWithContext

	return {
		...node,
		nodeValue: evaluatedNode.nodeValue,
		explanation: {
			...node.explanation,
			valeur: evaluatedNode,
		},
		missingVariables: evaluatedNode.missingVariables,
		...('unit' in evaluatedNode && { unit: evaluatedNode.unit }),
	}
}
registerEvaluationFunction('contexte', evaluateContexte)
