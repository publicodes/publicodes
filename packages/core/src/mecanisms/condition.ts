import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { PublicodesError } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { bonus, mergeAllMissing, mergeMissing } from '../evaluationUtils'
import parse from '../parse'

export type ConditionNode = {
	explanation: {
		si: ASTNode
		alors: ASTNode
		sinon: ASTNode
	}
	nodeKind: 'condition'
}

const evaluate: EvaluationFunction<'condition'> = function (node) {
	let evaluation
	const condition = this.evaluateNode(node.explanation.si)
	let alors = node.explanation.alors
	let sinon = node.explanation.sinon
	if ('unit' in condition) {
		throw new PublicodesError(
			'EvaluationError',
			'La condition doit être de type booléen',
			{ dottedName: this.cache._meta.evaluationRuleStack[0]?.dottedName },
		)
	}
	if (condition.nodeValue === true) {
		alors = this.evaluateNode(node.explanation.alors)
		;(alors as any).isActive = true
		evaluation = alors
	} else if (condition.nodeValue === false) {
		sinon = this.evaluateNode(node.explanation.sinon)
		evaluation = sinon
	} else if (condition.nodeValue === null) {
		evaluation = condition
	} else if (condition.nodeValue === undefined) {
		sinon = this.evaluateNode(node.explanation.sinon)
		alors = this.evaluateNode(node.explanation.alors)
		evaluation = {
			...condition,
			missingVariables: mergeAllMissing([sinon, alors]),
		}
	} else {
		throw new PublicodesError(
			'EvaluationError',
			'La condition doit être de type booléen',
			{ dottedName: this.cache._meta.evaluationRuleStack[0]?.dottedName },
		)
	}
	const unit = evaluation.unit ?? (alors as any).unit
	return {
		nodeValue: evaluation.nodeValue,
		missingVariables: mergeMissing(
			bonus(condition.missingVariables),
			evaluation.missingVariables,
		),
		...(unit != undefined ? { unit } : {}),
		...node,
		explanation: { si: condition, alors, sinon },
	}
}
export default function parseCondition(v, context) {
	const explanation = {
		si: parse(v.si, context),
		alors: parse(v.alors, context),
		sinon: parse(v.sinon, context),
	}
	return {
		explanation,
		nodeKind: 'condition',
	} as ConditionNode
}

parseCondition.nom = 'condition'

registerEvaluationFunction('condition', evaluate)
