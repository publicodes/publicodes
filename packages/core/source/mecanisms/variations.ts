import { EvaluationFunction } from '..'
import { ASTNode, EvaluatedNode, Unit } from '../AST/types'
import { warning } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode, mergeAllMissing } from '../evaluationUtils'
import { convertNodeToUnit } from '../nodeUnits'
import parse from '../parse'

export type VariationNode = {
	explanation: Array<{
		condition: ASTNode
		consequence: ASTNode
		satisfied?: boolean
	}>
	nodeKind: 'variations'
}

export const devariate = (k, v, context): ASTNode => {
	if (k === 'valeur') {
		return parse(v, context)
	}
	const { variations, ...factoredKeys } = v
	const explanation = parse(
		{
			variations: variations.map(({ alors, sinon, si }) => {
				const { attributs, ...otherKeys } = alors ?? sinon
				return {
					[alors !== undefined ? 'alors' : 'sinon']: {
						...attributs,
						[k]: {
							...factoredKeys,
							...otherKeys,
						},
					},
					...(si !== undefined && { si }),
				}
			}),
		},
		context
	)
	return explanation
}

export default function parseVariations(v, context): VariationNode {
	const explanation = v.map(({ si, alors, sinon }) =>
		sinon !== undefined
			? { consequence: parse(sinon, context), condition: defaultNode(true) }
			: { consequence: parse(alors, context), condition: parse(si, context) }
	)

	return {
		explanation,
		nodeKind: 'variations',
	}
}

const evaluate: EvaluationFunction<'variations'> = function (node) {
	const [nodeValue, explanation, unit] = node.explanation.reduce<
		[
			EvaluatedNode['nodeValue'],
			VariationNode['explanation'],
			Unit | undefined,
			boolean | undefined
		]
	>(
		(
			[evaluation, explanations, unit, previousConditions],
			{ condition, consequence },
			i: number
		) => {
			if (previousConditions === true) {
				return [
					evaluation,
					[...explanations, { condition, consequence }],
					unit,
					previousConditions,
				]
			}
			const evaluatedCondition = this.evaluateNode(condition)
			const currentCondition =
				previousConditions === undefined
					? previousConditions
					: !previousConditions &&
					  (evaluatedCondition.nodeValue === undefined
							? undefined
							: evaluatedCondition.nodeValue !== false &&
							  evaluatedCondition.nodeValue !== null)

			if (currentCondition === false || currentCondition === null) {
				return [
					evaluation,
					[...explanations, { condition: evaluatedCondition, consequence }],
					unit,
					previousConditions,
				]
			}
			let evaluatedConsequence: EvaluatedNode | undefined = undefined
			if (
				evaluatedCondition.nodeValue !== false &&
				evaluatedCondition.nodeValue !== null
			) {
				evaluatedConsequence = this.evaluateNode(consequence!)
				if (unit) {
					try {
						evaluatedConsequence = convertNodeToUnit(
							unit,
							evaluatedConsequence!
						)
					} catch (e) {
						warning(
							this.context.logger,
							this.cache._meta.evaluationRuleStack[0],
							`L'unité de la branche n° ${
								i + 1
							} du mécanisme 'variations' n'est pas compatible avec celle d'une branche précédente`,
							e
						)
					}
				}
			}
			return [
				currentCondition && evaluatedConsequence?.nodeValue,
				[
					...explanations,
					{
						condition: evaluatedCondition,
						consequence: evaluatedConsequence ?? consequence,
					},
				],
				unit || evaluatedConsequence?.unit,
				previousConditions || currentCondition,
			]
		},
		[null, [], undefined, false]
	)

	return {
		...node,
		nodeValue,
		...(unit !== undefined && { unit }),
		explanation,
		missingVariables: mergeAllMissing(
			explanation.reduce<ASTNode[]>(
				(values, { condition, consequence }) =>
					[
						...values,
						condition,
						...('nodeValue' in condition &&
						condition.nodeValue !== false &&
						condition.nodeValue !== null
							? [consequence]
							: []),
					] as any,
				[]
			)
		),
	}
}

registerEvaluationFunction('variations', evaluate)
