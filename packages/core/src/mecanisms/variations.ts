import { EvaluationFunction } from '..'
import { ASTNode, EvaluatedNode, Unit } from '../AST/types'
import { warning } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { bonus, defaultNode, mergeMissing } from '../evaluationUtils'
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

export default function parseVariations(v, context): VariationNode {
	const explanation = v.map(({ si, alors, sinon }) =>
		sinon !== undefined ?
			{ consequence: parse(sinon, context), condition: defaultNode(true) }
		:	{ consequence: parse(alors, context), condition: parse(si, context) },
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
			boolean | undefined,
		]
	>(
		(
			[evaluation, explanations, unit, previousConditions],
			{ condition, consequence },
			i: number,
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
				previousConditions === undefined ? previousConditions : (
					!previousConditions &&
					(evaluatedCondition.nodeValue === undefined ?
						undefined
					:	evaluatedCondition.nodeValue !== false &&
						evaluatedCondition.nodeValue !== null)
				)

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
							evaluatedConsequence!,
						)
					} catch (e) {
						warning(
							this.context.logger,
							`L'unité de la branche n° ${
								i + 1
							} du mécanisme 'variations' n'est pas compatible avec celle d'une branche précédente`,
							{ dottedName: this.cache._meta.evaluationRuleStack[0] },
							e,
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
		[null, [], undefined, false],
	)

	return {
		...node,
		nodeValue,
		...(unit !== undefined && { unit }),
		explanation,
		missingVariables: explanation.reduce(
			(values, { condition, consequence }) =>
				mergeMissing(
					values,
					mergeMissing(
						bonus((condition as EvaluatedNode).missingVariables),
						(
							'nodeValue' in condition &&
								condition.nodeValue !== false &&
								condition.nodeValue !== null
						) ?
							(consequence as EvaluatedNode).missingVariables
						:	{},
					),
				),
			{},
		),
	}
}

registerEvaluationFunction('variations', evaluate)
