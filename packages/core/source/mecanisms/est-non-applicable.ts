import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { bonus, mergeMissing } from '../evaluation'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { evaluateDisablingParent } from '../rule'

export type EstNonApplicableNode = {
	explanation: ASTNode
	nodeKind: 'est non applicable'
}
export function parseEstNonApplicable(v, context) {
	const explanation = parse(v, context)
	return {
		explanation,
		nodeKind: 'est non applicable',
	} as EstNonApplicableNode
}
parseEstNonApplicable.nom = 'est non applicable'

const isNotApplicable = (node: ASTNode) => {
	return {
		nodeKind: 'est non applicable',
		explanation: node,
	}
}

const evaluateIsNotApplicable: EvaluationFunction<'est non applicable'> =
	function (node) {
		const valeur = node.explanation
		console.log(valeur.nodeKind, valeur.dottedName, this.ruleUnits.get(valeur))
		if (
			this.ruleUnits.get(valeur)?.isNullable === false &&
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
				const isNotApplicableEvaluation = this.evaluate(
					isNotApplicable(valeur.explanation.valeur)
				)
				return {
					...node,
					nodeValue: isNotApplicableEvaluation.nodeValue,
					missingVariables: mergeMissing(
						bonus(parentMissingVariables),
						isNotApplicableEvaluation.missingVariables
					),
				}

			case 'reference':
				if (!valeur.dottedName) {
					throw new Error('Missing dottedName')
				}

				return {
					...this.evaluate(
						isNotApplicable(this.parsedRules[valeur.dottedName])
					),
					...node,
				}

			case 'condition':
				return {
					...this.evaluate({
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
		const evaluatedValeur = this.evaluate(valeur)

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
