import { EvaluationFunction, PublicodesError } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { notApplicableNode } from '../evaluationUtils'
import parse from '../parse'
import { ReferenceNode } from '../parseReference'
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
	const node = parse(v.valeur, context)

	const contexte = (
		Object.keys(v.contexte).map((dottedName) => [
			parse(dottedName, context),
			parse(v.contexte[dottedName], context),
		]) as Array<[ReferenceNode, ASTNode]>
	).sort(([a], [b]) => a.name.localeCompare(b.name))
	const contextHash = simpleHash(JSON.stringify(contexte))
	return {
		explanation: {
			valeur: node,
			contexte,
			subEngineId: contextHash,
		},
		nodeKind: parseMecanismContexte.nom,
	} as ContextNode
}
parseMecanismContexte.nom = 'contexte' as const

const evaluateContexte: EvaluationFunction<'contexte'> = function (node) {
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
	if (
		this.cache._meta.currentContexteSituation ===
		JSON.stringify(amendedSituation)
	) {
		// If the situation is the same as the last time we evaluated the contexte, it means that
		// there is a loop
		return {
			...notApplicableNode,
			...node,
		}
	}

	let engine
	if (this.context.subEngines.has(node.explanation.subEngineId)) {
		engine = this.context.subEngines.get(node.explanation.subEngineId)
	} else {
		engine = this.shallowCopy()
		engine.context.subEngineId = node.explanation.subEngineId
		this.context.subEngines.set(node.explanation.subEngineId, engine)

		if (Object.keys(amendedSituation).length) {
			engine.setSituation(amendedSituation, {
				keepPreviousSituation: true,
			})

			// The following code ensure that we use the **origin context** evaluation
			// for the values in the ammended situation

			// We do so by altering the cache so that the situation rule seems to have already
			// been evaluated

			// This is not an elegant way of doing so, but its temporary.
			// The correct implementation is discussed in :
			// https://github.com/publicodes/publicodes/discussions/92
			Object.entries(amendedSituation).forEach(([originDottedName, value]) => {
				const evaluation = this.cache.nodes.get(value)
				if (!evaluation) {
					throw new PublicodesError(
						'InternalError',
						'The situation should have already been evaluated',
						{
							dottedName: this.context.dottedName,
						},
					)
				}
				const originRule =
					engine.context.parsedRules[originDottedName + ' . $SITUATION']
				if (!originRule?.explanation.valeur) {
					throw new PublicodesError(
						'InternalError',
						'The origin rule should be defined',
						{
							dottedName: this.context.dottedName,
						},
					)
				}
				engine.cache.nodes.set(originRule.explanation.valeur, evaluation)
			})
		}
	}

	engine.cache._meta.currentContexteSituation = JSON.stringify(amendedSituation)
	const evaluatedNode = engine.evaluateNode(node.explanation.valeur)

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

function simpleHash(str) {
	let hash = 0
	for (let i = 0, len = str.length; i < len; i++) {
		const chr = str.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}
