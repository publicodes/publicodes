import { EvaluationFunction, PublicodesError } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode, mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import {
	evaluatePlafondUntilActiveTranche,
	parseTranches,
	TrancheNodes,
} from './trancheUtils'

export type GrilleNode = {
	explanation: {
		assiette: ASTNode
		multiplicateur: ASTNode
		tranches: TrancheNodes
	}
	nodeKind: 'grille'
}

export default function parseGrille(v, context): GrilleNode {
	const explanation = {
		assiette: parse(v.assiette, context),
		multiplicateur:
			v.multiplicateur ? parse(v.multiplicateur, context) : defaultNode(1),
		tranches: parseTranches(v.tranches, context),
	}
	return {
		explanation,
		nodeKind: 'grille',
	}
}

const evaluate: EvaluationFunction<'grille'> = function (node) {
	const evaluate = this.evaluateNode.bind(this)
	const assiette = this.evaluateNode(node.explanation.assiette)
	const multiplicateur = this.evaluateNode(node.explanation.multiplicateur)

	if (multiplicateur.nodeValue === 0) {
		throw new PublicodesError(
			'EvaluationError',
			`Le multiplicateur ne peut pas être nul`,
			{
				dottedName: this.cache._meta.evaluationRuleStack[0],
			},
		)
	}

	const tranches = evaluatePlafondUntilActiveTranche
		.call(this, {
			parsedTranches: node.explanation.tranches,
			assiette,
			multiplicateur,
		})
		.map((tranche) => {
			if (tranche.isActive === false) {
				return tranche
			}
			const montant = evaluate(tranche.montant)
			return {
				...tranche,
				montant,
				nodeValue: montant.nodeValue,
				unit: montant.unit,
				missingVariables: mergeAllMissing([montant, tranche]),
			}
		})

	let activeTranches
	const activeTranche = tranches.find((tranche) => tranche.isActive)
	if (activeTranche) {
		activeTranches = [activeTranche]
	} else if (tranches[tranches.length - 1].isAfterActive === false) {
		activeTranches = [{ nodeValue: false }]
	} else {
		activeTranches = tranches.filter(
			(tranche) => tranche.isActive === undefined,
		)
	}

	const nodeValue =
		!activeTranches[0] ? false
		: activeTranches[0].isActive === undefined ? undefined
		: activeTranches[0].nodeValue

	return {
		...node,
		nodeValue,
		missingVariables: mergeAllMissing([
			assiette,
			multiplicateur,
			...activeTranches,
		]),
		explanation: {
			...node.explanation,
			assiette,
			multiplicateur,
			tranches,
		},
		unit: activeTranches[0]?.unit ?? undefined,
	} as any
}

registerEvaluationFunction('grille', evaluate)
