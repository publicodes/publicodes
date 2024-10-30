import { EvaluationFunction, PublicodesError } from '..'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { convertToDate } from '../date'
import { warning } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { mergeAllMissing } from '../evaluationUtils'
import { convertNodeToUnit } from '../nodeUnits'
import parse from '../parse'
import { inferUnit, serializeUnit } from '../units'

const knownOperations = {
	'*': [(a, b) => a * b, '×'],
	'/': [(a, b) => a / b, '∕'],
	'//': [(a, b) => (a - a%b)/ b, '//'],
	'**': [(a, b) => a ** b, '**'],
	'+': [(a, b) => a + b],
	'-': [(a, b) => a - b, '−'],
	'<': [(a, b) => a < b],
	'<=': [(a, b) => a <= b, '≤'],
	'>': [(a, b) => a > b],
	'>=': [(a, b) => a >= b, '≥'],
	'=': [(a, b) => (a ?? false) === (b ?? false)],
	'!=': [(a, b) => (a ?? false) !== (b ?? false), '≠'],
	et: [(a, b) => (a ?? false) && (b ?? false)],
	ou: [(a, b) => (a ?? false) || (b ?? false)],
} as const

export type OperationNode = {
	nodeKind: 'operation'
	explanation: [ASTNode, ASTNode]
	operationKind: keyof typeof knownOperations
	operator: string
}

const parseOperation = (k, symbol) => (v, context) => {
	const explanation = v.map((node) => parse(node, context))

	return {
		...v,
		nodeKind: 'operation',
		operationKind: k,
		operator: symbol || k,
		explanation,
	} as OperationNode
}

const evaluate: EvaluationFunction<'operation'> = function (node) {
	let node1 = this.evaluateNode(node.explanation[0])

	let evaluatedNode: EvaluatedNode & OperationNode = {
		...node,
		missingVariables: {},
	} as EvaluatedNode & OperationNode

	// LAZY EVALUATION
	if (
		(node1.nodeValue === null &&
			['<', '>', '<=', '>=', '/', '*', '-', 'et'].includes(
				node.operationKind,
			)) ||
		(node1.nodeValue === 0 && ['/', '*'].includes(node.operationKind)) ||
		(node1.nodeValue === false && node.operationKind === 'et') ||
		(node1.nodeValue === true && node.operationKind === 'ou')
	) {
		return {
			...evaluatedNode,
			nodeValue: node.operationKind === 'et' ? false : node1.nodeValue,
			missingVariables: node1.missingVariables,
		}
	}

	let node2 = this.evaluateNode(node.explanation[1])
	evaluatedNode.explanation = [node1, node2]

	if (node.operationKind === '/' && node2.nodeValue === 0) {
		throw new PublicodesError('EvaluationError', `Division by zero`, {
			dottedName: this.cache._meta.evaluationRuleStack[0],
		})
	}

	// LAZY EVALUATION 2
	if (
		(node2.nodeValue === null &&
			['<', '>', '<=', '>=', '/', '*', 'et'].includes(node.operationKind)) ||
		(node2.nodeValue === 0 && ['*'].includes(node.operationKind)) ||
		(node2.nodeValue === false && node.operationKind === 'et') ||
		(node2.nodeValue === true && node.operationKind === 'ou')
	) {
		return {
			...evaluatedNode,
			nodeValue: node.operationKind === 'et' ? false : node2.nodeValue,
			missingVariables: node2.missingVariables,
		}
	}

	evaluatedNode.missingVariables = mergeAllMissing([node1, node2])

	if (node1.nodeValue === undefined || node2.nodeValue === undefined) {
		evaluatedNode = {
			...evaluatedNode,
			nodeValue: undefined,
		}
	}

	const isAdditionOrSubstractionWithPercentage =
		['+', '-'].includes(node.operationKind) &&
		serializeUnit(node2.unit) === '%' &&
		serializeUnit(node1.unit) !== '%'

	if (
		!('nodeValue' in evaluatedNode) &&
		!['/', '*'].includes(node.operationKind) &&
		!isAdditionOrSubstractionWithPercentage
	) {
		try {
			if (node1.unit && 'unit' in node2) {
				node2 = convertNodeToUnit(node1.unit, node2)
			} else if (node2.unit) {
				node1 = convertNodeToUnit(node2.unit, node1)
			}
		} catch (e) {
			warning(
				this.context.logger,
				`Dans l'expression '${
					node.operationKind
				}', la partie gauche (unité: ${serializeUnit(
					node1.unit,
				)}) n'est pas compatible avec la partie droite (unité: ${serializeUnit(
					node2.unit,
				)})`,
				{ dottedName: this.cache._meta.evaluationRuleStack[0] },
				e,
			)
		}
	}

	const operatorFunction = knownOperations[node.operationKind][0]

	const a = node1.nodeValue as string | boolean | null
	const b = node2.nodeValue as string | boolean | null

	evaluatedNode.nodeValue =
		'nodeValue' in evaluatedNode ? evaluatedNode.nodeValue
		: (
			['<', '>', '<=', '>=', '*', '/'].includes(node.operationKind) &&
			node2.nodeValue === null
		) ?
			null
		: (
			[a, b].every(
				(value) =>
					typeof value === 'string' &&
					value.match?.(/^[\d]{2}\/[\d]{2}\/[\d]{4}$/),
			)
		) ?
			// We convert the date objects to timestamps to support comparison with the "===" operator:
			// new Date('2020-01-01') !== new Date('2020-01-01')
			operatorFunction(
				convertToDate(a as string).getTime(),
				convertToDate(b as string).getTime(),
			)
		:	operatorFunction(a, b)

	if (
		node.operationKind === '*' &&
		inferUnit('*', [node1.unit, node2.unit])?.numerators.includes('%')
	) {
		const unit = inferUnit('*', [node1.unit, node2.unit])
		const nodeValue = evaluatedNode.nodeValue
		return {
			...evaluatedNode,
			nodeValue: typeof nodeValue === 'number' ? nodeValue / 100 : nodeValue,
			unit: inferUnit('*', [unit, { numerators: [], denominators: ['%'] }]),
		}
	}

	// Addition or substraction of scalar with a percentage is a multiplication
	// TODO : this logic should be handle statically by changing sum with percentage into product.
	// It can be done when we'll have a sound type/unit inference
	if (isAdditionOrSubstractionWithPercentage) {
		const unit = inferUnit('*', [node1.unit, node2.unit])
		return {
			...evaluatedNode,
			nodeValue:
				(
					typeof node1.nodeValue === 'number' &&
					typeof node2.nodeValue === 'number'
				) ?
					node1.nodeValue *
					(1 + (node2.nodeValue / 100) * (node.operationKind === '-' ? -1 : 1))
				:	evaluatedNode.nodeValue,
			unit: inferUnit('*', [unit, { numerators: [], denominators: ['%'] }]),
		}
	}

	if (
		node.operationKind === '*' ||
		node.operationKind === '/' ||
		node.operationKind === '-' ||
		node.operationKind === '+'
	) {
		return {
			...evaluatedNode,
			unit: inferUnit(node.operationKind, [node1.unit, node2.unit]),
		}
	}

	return evaluatedNode
}

registerEvaluationFunction('operation', evaluate)

const operationDispatch = Object.fromEntries(
	Object.entries(knownOperations).map(([k, [, symbol]]) => [
		k,
		parseOperation(k, symbol),
	]),
)

export default operationDispatch
