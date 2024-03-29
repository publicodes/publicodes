import { EvaluationFunction, PublicodesError } from '..'
import { ASTNode, EvaluatedNode, NodeKind } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode, mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import { convertUnit, parseUnit } from '../units'
import {
	TrancheNodes,
	evaluatePlafondUntilActiveTranche,
	parseTranches,
} from './trancheUtils'

// Barème en taux marginaux.
export type BarèmeNode = {
	explanation: {
		tranches: TrancheNodes
		multiplicateur: ASTNode
		assiette: ASTNode
	}
	nodeKind: 'barème'
}
export default function parseBarème(v, context): BarèmeNode {
	const explanation = {
		assiette: parse(v.assiette, context),
		multiplicateur:
			v.multiplicateur ? parse(v.multiplicateur, context) : defaultNode(1),
		tranches: parseTranches(v.tranches, context),
	}
	return {
		explanation,
		nodeKind: 'barème',
	}
}

function evaluateBarème(tranches, assiette, evaluate) {
	return tranches.map((tranche) => {
		if (tranche.isAfterActive) {
			return { ...tranche, nodeValue: 0 }
		}
		const taux = evaluate(tranche.taux)
		const missingVariables = mergeAllMissing([taux, tranche])

		if (
			[
				assiette.nodeValue,
				taux.nodeValue,
				tranche.plafondValue,
				tranche.plancherValue,
			].some((value) => value === undefined)
		) {
			return {
				...tranche,
				taux,
				nodeValue: undefined,
				missingVariables,
			}
		}
		return {
			...tranche,
			taux,
			...('unit' in assiette && { unit: assiette.unit }),
			nodeValue:
				(Math.min(assiette.nodeValue, tranche.plafondValue) -
					tranche.plancherValue) *
				convertUnit(taux.unit, parseUnit(''), taux.nodeValue as number),
			missingVariables,
		}
	})
}
const evaluate: EvaluationFunction<'barème'> = function (node) {
	const evaluate = this.evaluateNode.bind(this)
	const assiette = this.evaluateNode(
		node.explanation.assiette,
	) as EvaluatedNode<NodeKind, number>
	const multiplicateur = this.evaluateNode(node.explanation.multiplicateur)

	if (multiplicateur.nodeValue === 0) {
		throw new PublicodesError(
			'EvaluationError',
			`Le multiplicateur ne peut pas être nul`,
			{ dottedName: this.cache._meta.evaluationRuleStack[0] },
		)
	}

	let tranches: any = node.explanation.tranches
	let nodeValue = assiette.nodeValue

	if (![0, undefined, null].includes(assiette.nodeValue)) {
		tranches = evaluateBarème(
			evaluatePlafondUntilActiveTranche.call(this, {
				parsedTranches: node.explanation.tranches,
				assiette,
				multiplicateur,
			}),
			assiette,
			evaluate,
		)
		nodeValue = tranches.reduce(
			(value, { nodeValue }) =>
				nodeValue == undefined ? undefined : value + nodeValue,
			0,
		)
	}

	return {
		...node,
		nodeValue,
		missingVariables: mergeAllMissing([assiette, multiplicateur, ...tranches]),
		explanation: {
			assiette,
			multiplicateur,
			tranches,
		},
		unit: assiette.unit,
	} as any
}

registerEvaluationFunction('barème', evaluate)
