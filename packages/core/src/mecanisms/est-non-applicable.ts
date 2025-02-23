import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { evaluateRuleApplicability } from '../evaluateRule'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

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
			valeur.nodeKind !== 'rule' &&
			valeur.nodeKind !== 'reference'
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
			case 'rule': {
				return evaluateRuleApplicability(this, valeur)
			}
			case 'reference':
				return {
					...this.evaluateNode(
						isNotApplicable(this.context.parsedRules[valeur.dottedName!]),
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
				evaluatedValeur.nodeValue === undefined ?
					undefined
				:	evaluatedValeur.nodeValue === null,
			missingVariables: evaluatedValeur.missingVariables,
		}
	}

registerEvaluationFunction('est non applicable', evaluateIsNotApplicable)
