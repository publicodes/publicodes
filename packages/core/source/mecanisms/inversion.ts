import { EvaluationFunction } from '..'
import { ConstantNode, Unit } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { convertNodeToUnit } from '../nodeUnits'
import parse from '../parse'
import { Context } from '../parsePublicodes'
import { ReferenceNode } from '../reference'
import uniroot from '../uniroot'
import { parseUnit } from '../units'
import { UnitéNode } from './unité'

export type InversionNode = {
	explanation: {
		ruleToInverse: string
		inversionCandidates: Array<ReferenceNode>
		unit?: Unit
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
	node
) {
	const inversionGoal = node.explanation.inversionCandidates.find(
		(candidate) =>
			this.parsedSituation[candidate.dottedName as string] != undefined
	)

	if (inversionGoal === undefined) {
		return {
			...node,
			nodeValue: undefined,
		}
	}
	const evaluatedInversionGoal = this.evaluate(inversionGoal)
	const unit = 'unit' in node ? node.unit : evaluatedInversionGoal.unit
	const originalCache = this.cache
	const originalSituation = { ...this.parsedSituation }
	let inversionNumberOfIterations = 0
	delete this.parsedSituation[inversionGoal.dottedName as string]
	const evaluateWithValue = (n: number) => {
		inversionNumberOfIterations++
		this.resetCache()
		this.cache._meta = {
			evaluationRuleStack: [...originalCache._meta.evaluationRuleStack],
			parentRuleStack: [...originalCache._meta.parentRuleStack],
			traversedVariablesStack: [
				...originalCache._meta.traversedVariablesStack.map((s) => new Set(s)),
			],
		}
		this.parsedSituation[node.explanation.ruleToInverse] = {
			unit: unit,
			nodeKind: 'unité',
			explanation: {
				nodeKind: 'constant',
				nodeValue: n,
				type: 'number',
			} as ConstantNode,
		} as UnitéNode

		return convertNodeToUnit(unit, this.evaluate(inversionGoal))
	}

	const goal = convertNodeToUnit(unit, evaluatedInversionGoal)
		.nodeValue as number
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

	const maxIterations = this.options.inversionMaxIterations ?? 10

	if (y1 !== undefined || y2 !== undefined) {
		// The `uniroot` function parameter. It will be called with its `min` and
		// `max` arguments, so we can use our cached nodes if the function is called
		// with the already computed x1 or x2.
		const test = (x: number): number => {
			const y = x === x1 ? y1 : x === x2 ? y2 : evaluateWithValue(x).nodeValue
			return (y as number) - goal
		}

		const defaultMin = -1000000
		const defaultMax = 100000000
		const nearestBelowGoal =
			y2 !== undefined && y2 < goal && (y2 > y1 || y1 > goal)
				? x2
				: y1 !== undefined && y1 < goal && (y1 > y2 || y2 > goal)
				? x1
				: defaultMin
		const nearestAboveGoal =
			y2 !== undefined && y2 > goal && (y2 < y1 || y1 < goal)
				? x2
				: y1 !== undefined && y1 > goal && (y1 < y2 || y2 < goal)
				? x1
				: defaultMax

		nodeValue = uniroot(
			test,
			nearestBelowGoal,
			nearestAboveGoal,
			0.1,
			maxIterations,
			1
		)
	}

	if (nodeValue === undefined) {
		this.cache._meta.inversionFail = true
	}

	// Reset cache
	this.cache = { ...originalCache, _meta: this.cache._meta }
	this.parsedSituation = originalSituation

	// // Uncomment to display the two attempts and their result
	// console.table([{ x: x1, y: y1 }, { x: x2, y: y2 }])
	// console.log('iteration inversion:', inversionNumberOfIterations)

	return {
		...node,
		unit,
		nodeValue,
		explanation: {
			...node.explanation,
			inversionGoal,
			inversionNumberOfIterations,
		},
	}
}

export const mecanismInversion = (v, context: Context) => {
	if (!v.avec) {
		throw new Error(
			"Une formule d'inversion doit préciser _avec_ quoi on peut inverser la variable"
		)
	}
	return {
		explanation: {
			ruleToInverse: context.dottedName,
			inversionCandidates: v.avec.map((node) => ({
				...parse(node, { ...context, circularReferences: true }),
			})),
		},
		...('unité' in v && {
			unit: parseUnit(v.unité, context.getUnitKey),
		}),
		nodeKind: 'inversion',
	} as InversionNode
}

registerEvaluationFunction('inversion', evaluateInversion)
