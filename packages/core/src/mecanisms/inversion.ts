import { EvaluationFunction, PublicodesError } from '..'
import { ASTNode, EvaluatedNode, Unit } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { undefinedNumberNode } from '../evaluationUtils'
import parse from '../parse'
import { Context } from '../parsePublicodes'
import { ReferenceNode } from '../reference'
import uniroot from '../uniroot'

export type InversionNode = {
	explanation: {
		ruleToInverse: string
		inversionCandidates: Array<ReferenceNode>
		min: number
		max: number
		errorTolerance: number
		unit?: Unit

		// Explanation computed during evaluation
		inversionGoal?: ASTNode
		numberOfIteration?: number
		inversionFail?: boolean
	}
	nodeKind: 'inversion'
}

// The user of the inversion mechanism has to define a list of "inversion
// candidates". At runtime, the evaluation function of the mechanism will look
// at the situation value of these candidates, and use the first one that is
// defined as its "goal" for the inversion
//
// The game is then to find an input such as the computed value of the "goal" is
// equal to its situation value, mathematically we search for the zero of the
// function x → f(x) - goal. The iteration logic between each test is
// implemented in the `uniroot` file.
export const evaluateInversion: EvaluationFunction<'inversion'> = function (
	node,
) {
	const inversionEngine = this.shallowCopy()
	if (
		this.cache._meta.evaluationRuleStack
			.slice(1)
			.includes(node.explanation.ruleToInverse)
	) {
		return {
			...undefinedNumberNode,
			...node,
		}
	}
	inversionEngine.cache._meta.parentRuleStack = [
		...this.cache._meta.parentRuleStack,
	]
	inversionEngine.cache._meta.evaluationRuleStack = [
		...this.cache._meta.evaluationRuleStack,
	]
	const inversionGoal = node.explanation.inversionCandidates.find(
		(candidate) => {
			if (
				this.cache._meta.evaluationRuleStack.includes(candidate.dottedName!)
			) {
				return false
			}
			const evaluation = inversionEngine.evaluateNode(
				inversionEngine.context.parsedRules[
					`${candidate.dottedName} . $SITUATION`
				],
			)
			return (
				typeof evaluation.nodeValue === 'number' &&
				!(candidate.dottedName! in evaluation.missingVariables)
			)
		},
	)
	if (inversionGoal === undefined) {
		return {
			...node,
			nodeValue: undefined,
			missingVariables: {
				...Object.fromEntries(
					node.explanation.inversionCandidates.map((candidate) => [
						candidate.dottedName,
						1,
					]),
				),
				[node.explanation.ruleToInverse]: 1,
			},
		}
	}

	const evaluatedInversionGoal = inversionEngine.evaluateNode(inversionGoal)
	let numberOfIteration = 0

	inversionEngine.setSituation(
		{
			[inversionGoal.dottedName!]: undefinedNumberNode,
		},
		{ keepPreviousSituation: true },
	)

	inversionEngine.cache.traversedVariablesStack =
		this.cache.traversedVariablesStack ? [] : undefined

	let lastEvaluation: EvaluatedNode
	const evaluateWithValue = (n: number) => {
		numberOfIteration++
		inversionEngine.setSituation(
			{
				[node.explanation.ruleToInverse]: {
					nodeValue: n,
					nodeKind: 'constant',
					type: 'number',
					unit: evaluatedInversionGoal.unit,
				},
			},
			{ keepPreviousSituation: true },
		)
		inversionEngine.cache.traversedVariablesStack =
			this.cache.traversedVariablesStack ? [] : undefined

		lastEvaluation = inversionEngine.evaluateNode(inversionGoal)

		return lastEvaluation
	}

	const goal = evaluatedInversionGoal.nodeValue as number
	let nodeValue: number | undefined | undefined = undefined

	// We do some blind attempts here to avoid using the default minimum and
	// maximum of +/- 10^8 that are required by the `uniroot` function. For the
	// first attempt we use the goal value as a very rough first approximation.
	// For the second attempt we do a proportionality coefficient with the result
	// from the first try and the goal value. The two attempts are then used in
	// the following way:
	// - if both results are `undefined` we assume that the inversion is impossible
	//   because of missing variables
	// - otherwise, we calculate the missing variables of the node as the union of
	//   the missings variables of our two attempts
	// - we cache the result of our two attempts so that `uniroot` doesn't
	//   recompute them
	const x1 = goal
	const y1Node = evaluateWithValue(x1)
	const y1 = y1Node.nodeValue as number
	const coeff = y1 > goal ? 0.9 : 1.2
	const x2 = y1 !== undefined ? (x1 * goal * coeff) / y1 : 2000
	const y2Node = evaluateWithValue(x2)
	const y2 = y2Node.nodeValue as number

	const maxIterations = this.context.inversionMaxIterations ?? 10

	if (y1 !== undefined || y2 !== undefined) {
		// The `uniroot` function parameter. It will be called with its `min` and
		// `max` arguments, so we can use our cached nodes if the function is called
		// with the already computed x1 or x2.
		const test = (x: number): number => {
			const y =
				x === x1 ? y1
				: x === x2 ? y2
				: evaluateWithValue(x).nodeValue
			return (y as number) - goal
		}

		const nearestBelowGoal =
			y2 !== undefined && y2 < goal && (y2 > y1 || y1 > goal) ? x2
			: y1 !== undefined && y1 < goal && (y1 > y2 || y2 > goal) ? x1
			: node.explanation.min
		const nearestAboveGoal =
			y2 !== undefined && y2 > goal && (y2 < y1 || y1 < goal) ? x2
			: y1 !== undefined && y1 > goal && (y1 < y2 || y2 < goal) ? x1
			: node.explanation.max
		const errorTolerance = node.explanation.errorTolerance

		nodeValue = uniroot(
			test,
			nearestBelowGoal,
			nearestAboveGoal,
			errorTolerance,
			maxIterations,
			1,
		)

		// nodeValue found is out of min/max bound
		if (
			nodeValue &&
			(nodeValue < node.explanation.min || nodeValue > node.explanation.max)
		) {
			nodeValue = undefined
		}
	}

	if (nodeValue == undefined) {
		this.cache.inversionFail = true
	}

	// Uncomment to display the two attempts and their result
	// console.table([
	// 	{ x: x1, y: y1 },
	// 	{ x: x2, y: y2 },
	// ])
	// console.log('iteration inversion:', numberOfIteration)
	if (this.cache.traversedVariablesStack) {
		const traversedVariablesStack = this.cache.traversedVariablesStack[0]
		if (traversedVariablesStack) {
			;(lastEvaluation!.traversedVariables ?? []).forEach((v) =>
				traversedVariablesStack.add(v),
			)
		}
	}
	return {
		...node,
		nodeValue,
		unit: evaluatedInversionGoal.unit,
		explanation: {
			...node.explanation,
			inversionGoal,
			numberOfIteration,
			inversionFail: this.cache.inversionFail,
		},
		missingVariables: lastEvaluation!.missingVariables,
	}
}

export const mecanismInversion = (v, context: Context) => {
	let avec = typeof v === 'object' && 'avec' in v ? v.avec : v
	const min = typeof v === 'object' && 'min' in v ? v.min : -1000000
	const max = typeof v === 'object' && 'max' in v ? v.max : 100000000
	const errorTolerance =
		typeof v === 'object' && "tolérance d'erreur" in v ?
			v["tolérance d'erreur"]
		:	0.1
	if (v === null) {
		throw new PublicodesError(
			'SyntaxError',
			"Il manque les règles avec laquelle effectuer le calcul d'inversion dans le mécanisme `inversion numérique`",
			{ dottedName: context.dottedName },
		)
	}
	if (!Array.isArray(avec)) {
		avec = [avec]
	}
	return {
		explanation: {
			ruleToInverse: context.dottedName,
			inversionCandidates: avec.map((node) => ({
				...parse(node, context),
			})),
			min,
			max,
			errorTolerance,
		},
		nodeKind: 'inversion',
	} as InversionNode
}

registerEvaluationFunction('inversion', evaluateInversion)
