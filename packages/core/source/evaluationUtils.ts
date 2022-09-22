import { PublicodesError } from '.'
import { ASTNode, ConstantNode, EvaluatedNode, Evaluation } from './AST/types'
import parse from './parse'

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

export const parseObject = (objectShape, value, context) => {
	return Object.fromEntries(
		Object.entries(objectShape).map(([key, defaultValue]) => {
			if (value[key] == undefined && !defaultValue) {
				throw new PublicodesError(
					'EngineError',
					`Il manque une clé '${key}' dans ${JSON.stringify(value)} `,
					{}
				)
			}

			const parsedValue =
				value[key] != undefined ? parse(value[key], context) : defaultValue
			return [key, parsedValue]
		})
	)
}
