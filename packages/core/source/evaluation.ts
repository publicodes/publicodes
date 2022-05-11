import Engine from '.'
import { ConstantNode, Evaluation } from './AST/types'
import { warning } from './error'
import { convertNodeToUnit } from './nodeUnits'
import parse from './parse'

function convertNodesToSameUnit(this: Engine, nodes, mecanismName) {
	const firstNodeWithUnit = nodes.find((node) => !!node.unit)
	if (!firstNodeWithUnit) {
		return nodes
	}
	return nodes.map((node) => {
		try {
			return convertNodeToUnit(firstNodeWithUnit.unit, node)
		} catch (e) {
			warning(
				this.options.logger,
				this.cache._meta.evaluationRuleStack[0],
				`Les unités des éléments suivants sont incompatibles entre elles : \n\t\t${
					node?.name || node?.rawNode
				}\n\t\t${firstNodeWithUnit?.name || firstNodeWithUnit?.rawNode}'`,
				e
			)
			return node
		}
	})
}

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
				throw new Error(
					`Il manque une clé '${key}' dans ${JSON.stringify(value)} `
				)
			}

			const parsedValue =
				value[key] != undefined ? parse(value[key], context) : defaultValue
			return [key, parsedValue]
		})
	)
}
