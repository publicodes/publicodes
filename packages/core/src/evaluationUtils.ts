import { ASTNode, ConstantNode, EvaluatedNode, Evaluation } from './AST/types'

export const collectNodeMissing = (
	node: EvaluatedNode | ASTNode,
): Record<string, number> =>
	'missingVariables' in node ? node.missingVariables : {}

export const bonus = (missings: Record<string, number> = {}) => {
	const result: Record<string, number> = {}
	for (const key in missings) {
		result[key] = missings[key] + 1
	}
	return result
}

const addMissing = (
	target: Record<string, number>,
	source: Record<string, number>,
) => {
	for (const key in source) {
		target[key] = (target[key] ?? 0) + source[key]
	}
	return target
}

export const mergeMissing = (
	left: Record<string, number> | undefined = {},
	right: Record<string, number> | undefined = {},
): Record<string, number> => addMissing(addMissing({}, left), right)

export const mergeAllMissing = (missings: Array<EvaluatedNode | ASTNode>) => {
	const result: Record<string, number> = {}
	for (const node of missings) {
		addMissing(result, collectNodeMissing(node))
	}
	return result
}

export const defaultNode = (nodeValue: Evaluation) =>
	({
		nodeValue,
		type: typeof nodeValue,
		isDefault: true,
		nodeKind: 'constant',
	}) as ConstantNode

export const notApplicableNode = {
	nodeKind: 'constant',
	nodeValue: null,
	missingVariables: {},
	type: undefined,
	isNullable: true,
} as EvaluatedNode<'constant'>

export const undefinedNode = {
	nodeKind: 'constant',
	nodeValue: undefined,
	missingVariables: {},
	type: undefined,
	isNullable: false,
} as EvaluatedNode<'constant'>

export const undefinedNumberNode = {
	...undefinedNode,
	type: 'number',
} as EvaluatedNode<'constant'>
