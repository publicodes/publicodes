import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { Context } from '../parsePublicodes'
import uniroot from '../uniroot'
import { undefinedNumberNode } from './inlineMecanism'

export type RésoudreRéférenceCirculaireNode = {
	explanation: {
		ruleToSolve: string
		valeur: ASTNode
	}
	nodeKind: 'résoudre référence circulaire'
}

export const evaluateRésoudreRéférenceCirculaire: EvaluationFunction<'résoudre référence circulaire'> =
	function (node) {
		if (
			this.cache._meta.evaluationRuleStack
				.slice(1)
				.includes(node.explanation.ruleToSolve)
		) {
			return {
				...undefinedNumberNode,
				...node,
			}
		}

		let numberOfIterations = 0
		const calculationEngine = this.shallowCopy()
		calculationEngine.cache._meta.parentRuleStack = [
			...this.cache._meta.parentRuleStack,
		]
		calculationEngine.cache._meta.evaluationRuleStack = [
			...this.cache._meta.evaluationRuleStack,
		]
		const maxIterations = this.context.inversionMaxIterations ?? 25

		const evaluateWithValue = (n: number) => {
			numberOfIterations++
			calculationEngine.setSituation(
				{
					[node.explanation.ruleToSolve]: {
						...undefinedNumberNode,
						nodeValue: n,
					},
				},
				{ keepPreviousSituation: true }
			)

			return calculationEngine.evaluateNode(node.explanation.valeur)
		}

		const inversionFailed = Symbol('inversion failed')

		let nodeValue: number | undefined | typeof inversionFailed = inversionFailed

		const x0 = 1
		let valeur = evaluateWithValue(x0)
		const y0 = valeur.nodeValue as number
		const unit = valeur.unit
		let i = 0
		if (y0 !== undefined) {
			// The `uniroot` function parameter. It will be called with its `min` and
			// `max` arguments, so we can use our cached nodes if the function is called
			// with the already computed x1 or x2.
			const test = (x: number): number => {
				if (x === x0) {
					return y0 - x0
				}
				valeur = evaluateWithValue(x)
				const y = valeur.nodeValue
				i++
				return (y as number) - x
			}

			const defaultMin = -1_000_000
			const defaultMax = 100_000_000

			nodeValue = uniroot(test, defaultMin, defaultMax, 0.5, maxIterations, 2)
		}

		if (nodeValue === inversionFailed) {
			nodeValue = undefined
			this.cache._meta.inversionFail = true
		}
		if (nodeValue !== undefined) {
			valeur = evaluateWithValue(nodeValue)
		}
		return {
			...node,
			unit,
			nodeValue,
			explanation: {
				...node.explanation,
				valeur,
				numberOfIterations,
			},
			missingVariables: valeur.missingVariables,
		}
	}

export default function parseRésoudreRéférenceCirculaire(v, context: Context) {
	return {
		explanation: {
			ruleToSolve: context.dottedName,
			valeur: parse(v.valeur, context),
		},
		nodeKind: 'résoudre référence circulaire',
	} as RésoudreRéférenceCirculaireNode
}

parseRésoudreRéférenceCirculaire.nom = 'résoudre la référence circulaire'

registerEvaluationFunction(
	'résoudre référence circulaire',
	evaluateRésoudreRéférenceCirculaire
)
