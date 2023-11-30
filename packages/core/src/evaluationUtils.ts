import { ASTNode, ConstantNode, EvaluatedNode, Evaluation } from './AST/types'

export const collectNodeMissing = (
	node: EvaluatedNode | ASTNode
): Record<string, number> =>
	'missingVariables' in node ? node.missingVariables : {}

export const bonus = (missings: Record<string, number> = {}) =>
	Object.fromEntries(
		Object.entries(missings).map(([key, value]) => [key, value + 1])
	)
export const mergeMissing = (
	left: Record<string, number> | undefined = {},
	right: Record<string, number> | undefined = {}
): Record<string, number> =>
	Object.fromEntries(
		[...Object.keys(left), ...Object.keys(right)].map((key) => [
			key,
			(left[key] ?? 0) + (right[key] ?? 0),
		])
	)

export const mergeAllMissing = (missings: Array<EvaluatedNode | ASTNode>) =>
	missings.map(collectNodeMissing).reduce(mergeMissing, {})

export const defaultNode = (nodeValue: Evaluation) =>
	({
		nodeValue,
		type: typeof nodeValue,
		isDefault: true,
		nodeKind: 'constant',
	} as ConstantNode)

export const notApplicableNode = {
	nodeKind: 'constant',
	nodeValue: null,
	missingVariables: {},
	type: undefined,
	isNullable: true,
} as ConstantNode & EvaluatedNode

export const undefinedNode = {
	nodeKind: 'constant',
	nodeValue: undefined,
	missingVariables: {},
	type: undefined,
	isNullable: false,
} as ConstantNode & EvaluatedNode

export const undefinedNumberNode = {
	...undefinedNode,
	type: 'number',
} as ConstantNode & EvaluatedNode
