import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { mergeMissing } from '../evaluationUtils'
import parse from '../parse'
import { evaluateDisablingParent, updateRuleMissingVariables } from '../rule'

export type EstNonApplicableNode = {
	explanation: ASTNode
	nodeKind: 'est non applicable'
}
export function parseEstNonApplicable(v, context) {
	const explanation = parse(v, context)
	return {
		explanation,
		nodeKind: 'est non applicable' as const,
	} as EstNonApplicableNode
}
parseEstNonApplicable.nom = 'est non applicable'

const isNotApplicable = (node: ASTNode) => {
	return {
		nodeKind: 'est non applicable' as const,
		explanation: node,
	}
}

const evaluateIsNotApplicable: EvaluationFunction<'est non applicable'> =
	function (node) {
		const valeur = node.explanation
		if (
			this.context.nodesTypes.get(valeur)?.isNullable === false &&
			valeur.nodeKind !== 'rule'
		) {
			return { ...node, nodeValue: false, missingVariables: {} }
		}

		if (
			this.cache.nodes.has(valeur) &&
			this.cache.nodes.get(valeur) !== undefined
		) {
			return {
				...node,
				nodeValue: this.cache.nodes.get(valeur)?.nodeValue === null,
				missingVariables: this.cache.nodes.get(valeur)?.missingVariables ?? {},
			}
		}

		switch (valeur.nodeKind) {
			case 'rule':
				const { ruleDisabledByItsParent, parentMissingVariables } =
					evaluateDisablingParent(this, valeur)
				if (ruleDisabledByItsParent) {
					return {
						...node,
						nodeValue: true,
						missingVariables: parentMissingVariables,
					}
				}
				const isNotApplicableEvaluation = this.evaluateNode(
					isNotApplicable(valeur.explanation.valeur)
				)
				return {
					...node,
					nodeValue: isNotApplicableEvaluation.nodeValue,
					missingVariables: mergeMissing(
						parentMissingVariables,
						updateRuleMissingVariables(this, valeur, isNotApplicableEvaluation)
					),
				}

			case 'reference':
				if (!valeur.dottedName) {
					throw new Error('Missing dottedName')
				}

				return {
					...this.evaluateNode(
						isNotApplicable(this.context.parsedRules[valeur.dottedName])
					),
					...node,
				}

			case 'condition':
				return {
					...this.evaluateNode({
						...valeur,
						explanation: {
							si: valeur.explanation.si,
							alors: isNotApplicable(valeur.explanation.alors),
							sinon: isNotApplicable(valeur.explanation.sinon),
						},
					}),
					...node,
				}
		}
		const evaluatedValeur = this.evaluateNode(valeur)

		return {
			...node,
			nodeValue:
				evaluatedValeur.nodeValue === undefined
					? undefined
					: evaluatedValeur.nodeValue === null,
			missingVariables: evaluatedValeur.missingVariables,
		}
	}

registerEvaluationFunction('est non applicable', evaluateIsNotApplicable)
