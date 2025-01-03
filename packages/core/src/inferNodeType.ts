import { ParsedRules } from '.'
import { ASTNode, ConstantNode } from './AST/types'

export type NodesTypes = WeakMap<ASTNode, InferedType>

// TODO: Currently only handle nullability, but the infering logic should be
// extended to support the full unit type system.
export type InferedType = {
	isNullable: boolean | undefined
} & Pick<ConstantNode, 'type'>

const UNDEFINED_TYPE = {
	isNullable: undefined,
	type: undefined,
}

export default function inferNodesTypes(
	newRulesNames: Array<string>,
	parsedRules: ParsedRules<string>,
	nodesTypes: NodesTypes,
) {
	function inferNodeUnitAndCache(node: ASTNode): InferedType {
		if (!node || typeof node !== 'object') {
			return UNDEFINED_TYPE
		}
		if (nodesTypes.has(node)) {
			return nodesTypes.get(node)!
		}
		// Sometimes there are cycles, so we need to prevent infinite loop by setting a default
		nodesTypes.set(node, UNDEFINED_TYPE)
		const type = inferNodeType(node)
		nodesTypes.set(node, type)
		return type
	}

	function inferNodeType(node: ASTNode): InferedType {
		switch (node.nodeKind) {
			case 'barème':
			case 'durée':
			case 'grille':
			case 'taux progressif':
			case 'inversion':
			case 'résoudre référence circulaire':
				return { isNullable: false, type: 'number' }
			case 'est non défini':
			case 'est non applicable':
				return { isNullable: false, type: 'boolean' }

			case 'constant':
				return {
					isNullable: node.isNullable ?? node.nodeValue === null,
					type: node.type,
				}
			case 'operation':
				return {
					isNullable:
						['<', '<=', '>', '>=', '/', '*'].includes(node.operationKind) ?
							inferNodeUnitAndCache(node.explanation[0]).isNullable ||
							inferNodeUnitAndCache(node.explanation[1]).isNullable
						: node.operationKind === '-' ?
							inferNodeUnitAndCache(node.explanation[0]).isNullable
						:	false,
					type:
						(
							['<', '<=', '>', '>=', '=', '!=', 'et', 'ou'].includes(
								node.operationKind,
							)
						) ?
							'boolean'
						:	'number',
				}

			case 'replacementRule':
				return { isNullable: false, type: undefined }
			case 'texte':
				return { isNullable: false, type: 'string' }

			case 'arrondi':
				return {
					type: 'number',
					isNullable: inferNodeUnitAndCache(node.explanation.valeur).isNullable,
				}
			case 'contexte':
				return inferNodeUnitAndCache(node.explanation.valeur)
			case 'une possibilité':
				return node.type === 'reference' ?
						{
							isNullable: node.explanation.every(
								(n) => inferNodeUnitAndCache(n).isNullable,
							),
							type: 'string',
						}
					:	{
							isNullable: false,
							type: node.type,
						}

			case 'rule':
				{
					const typeInfo = inferNodeUnitAndCache(node.explanation.valeur)
					if (node.possibilities) {
						const possibilityTypeInfo = inferNodeUnitAndCache(
							node.possibilities,
						)
						return {
							isNullable: typeInfo.isNullable || possibilityTypeInfo.isNullable,
							type: possibilityTypeInfo.type,
						}
					}
					if (typeInfo.type !== undefined) {
						return typeInfo
					}
					let type =
						node.rawNode.type === 'nombre' ? 'number'
						: node.rawNode.type === 'texte' ? 'string'
						: node.rawNode.type === 'date' ? 'date'
						: node.rawNode.type === 'booléen' ? 'boolean'
						: undefined

					if (!type && node.rawNode.question) {
						type = 'boolean'
					}
					return { isNullable: typeInfo.isNullable, type } as InferedType
				}
				break
			case 'unité':
			case 'simplifier unité':
				return {
					type: 'number',
					isNullable: inferNodeUnitAndCache(node.explanation).isNullable,
				}
			case 'variable manquante':
				return inferNodeUnitAndCache(node.explanation)
			case 'condition':
				return {
					isNullable: [
						node.explanation.si,
						node.explanation.alors,
						node.explanation.sinon,
					].some((n) => inferNodeUnitAndCache(n).isNullable),
					type:
						inferNodeUnitAndCache(node.explanation.alors).type ??
						inferNodeUnitAndCache(node.explanation.sinon).type,
				}

			case 'variations': {
				const consequencesTypes = node.explanation.map(({ consequence }) =>
					inferNodeUnitAndCache(consequence),
				)
				return {
					isNullable: consequencesTypes.some(
						(consequence) => consequence.isNullable,
					),
					type: consequencesTypes
						.map((c) => c.type)
						.find((type) => type !== undefined),
				}
			}

			case 'reference':
				return inferNodeUnitAndCache(parsedRules[node.dottedName as string])
		}
	}

	newRulesNames.forEach((name) => {
		const rule = parsedRules[name]
		inferNodeUnitAndCache(rule)
		rule.explanation.parents.forEach(inferNodeUnitAndCache)
	})

	return nodesTypes
}
