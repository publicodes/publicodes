import { ParsedRules } from '.'
import { ASTNode } from './AST/types'

export type NodesTypes = WeakMap<ASTNode, InferedType>

// TODO: Currently only handle nullability, but the infering logic should be
// extended to support the full unit type system.
export type InferedType = {
	isNullable: boolean | undefined
	type: 'string' | 'number' | 'boolean' | 'objet' | undefined
}

const UNDEFINED_TYPE = {
	isNullable: undefined,
	type: undefined,
}

export default function inferNodesTypes(
	newRulesNames: Array<string>,
	parsedRules: ParsedRules<string>,
	nodesTypes: NodesTypes
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
					isNullable: ['<', '<=', '>', '>=', '/', '*'].includes(
						node.operationKind
					)
						? inferNodeUnitAndCache(node.explanation[0]).isNullable ||
						  inferNodeUnitAndCache(node.explanation[1]).isNullable
						: node.operationKind === '-'
						? inferNodeUnitAndCache(node.explanation[0]).isNullable
						: false,
					type: ['<', '<=', '>', '>=', '=', '!=', 'et', 'ou'].includes(
						node.operationKind
					)
						? 'boolean'
						: 'number',
				}

			case 'inversion':
			case 'recalcul':
			case 'replacementRule':
			case 'résoudre référence circulaire':
			case 'synchronisation':
				// TODO: Synchronisation can also be used for texts. This doens't have
				// any runtime consequence currently because the only type we only
				// really care about is boolean for branch disabling.
				return { isNullable: false, type: 'number' }

			case 'texte':
			case 'une possibilité':
				return { isNullable: false, type: 'string' }

			case 'rule':
			case 'arrondi':
				return inferNodeUnitAndCache(node.explanation.valeur)
			case 'unité':
			case 'simplifier unité':
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

			case 'variations':
				const consequencesTypes = node.explanation.map(({ consequence }) =>
					inferNodeUnitAndCache(consequence)
				)
				return {
					isNullable: consequencesTypes.some(
						(consequence) => consequence.isNullable
					),
					type: consequencesTypes
						.map((c) => c.type)
						.find((type) => type !== undefined),
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
