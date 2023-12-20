import { ParsedRules } from '..'
import { UnreachableCaseError } from '../error'
import { TrancheNodes } from '../mecanisms/trancheUtils'
import { ReferenceNode } from '../reference'
import { ReplacementRule } from '../replacement'
import { weakCopyObj } from '../utils'
import {
	ASTNode,
	ASTTransformer,
	ASTVisitor,
	NodeKind,
	TraverseFunction,
} from './types'

/**
	This function creates a transormation of the AST from on a simpler
	callback function `fn`

	`fn` will be called with the nodes of the ASTTree during the exploration

	The outcome of the callback function has an influence on the exploration of the AST :
	- `false`, the node is not updated and the exploration does not continue further down this branch
	- `undefined`, the node is not updated but the exploration continues and its children will be transformed
	- `ASTNode`, the node is transformed to the new value and the exploration does not continue further down the branch

	`updateFn` : It is possible to specifically use the updated version of a child
	by using the function passed as second argument. The returned value will be the
	transformed version of the node.
	*/
export function makeASTTransformer(
	fn: (node: ASTNode, transform: ASTTransformer) => ASTNode | undefined | false,
	stopOnUpdate = true,
): ASTTransformer {
	function transform(node: ASTNode): ASTNode {
		const updatedNode = fn(node, transform)
		if (updatedNode === false) {
			return node
		}
		if (updatedNode === undefined) {
			return traverseASTNode(transform, node)
		}
		return stopOnUpdate ? updatedNode : traverseASTNode(transform, updatedNode)
	}
	return transform
}
export function makeASTVisitor(
	fn: (node: ASTNode, visit: ASTVisitor) => 'continue' | 'stop',
): ASTVisitor {
	function visit(node: ASTNode) {
		switch (fn(node, visit)) {
			case 'continue':
				traverseASTNode(transformizedVisit, node)
				return
			case 'stop':
				return
		}
	}
	const transformizedVisit: ASTTransformer = (node) => {
		visit(node)
		return node
	}
	return visit
}

// Can be made more flexible with other args like a filter function (ASTNode -> Bool).
export function iterAST(
	childrenSelector: (node: ASTNode) => Iterable<ASTNode>,
	node: ASTNode,
): ASTNode[] {
	function* iterate(node: ASTNode): IterableIterator<ASTNode> {
		yield node
		const selectedSubNodes = childrenSelector(node)
		for (const subNode of selectedSubNodes) yield* iterate(subNode)
	}
	return [...iterate(node)]
}

/**
 * This function allows to construct a specific value while exploring the AST with
 * a simple reducing function as argument.
 *
 * `fn` will be called with the currently reduced value `acc` and the current node of the AST
 *
 * If the callback function returns:
 * - `undefined`, the exploration continues further down and all the children are reduced
 * 	successively to a single value
 * - `T`, the reduced value is returned
 *
 * `reduceFn` : It is possible to specifically use the reduced value of a child
 * by using the function passed as second argument. The returned value will be the reduced version
 * of the node
 */
export function reduceAST<T>(
	fn: (acc: T, n: ASTNode, reduceFn: (n: ASTNode) => T) => T | undefined,
	start: T,
	node: ASTNode,
): T {
	function traverseFn(acc: T, node: ASTNode): T {
		const result = fn(acc, node, traverseFn.bind(null, start))
		if (result === undefined) {
			return getChildrenNodes(node).reduce(traverseFn, acc)
		}
		return result
	}
	return traverseFn(start, node)
}

export function getChildrenNodes(node: ASTNode): ASTNode[] {
	const nodes: ASTNode[] = []
	traverseASTNode((node) => {
		nodes.push(node)
		return node
	}, node)
	return nodes
}

export function traverseParsedRules<Names extends string>(
	fn: ASTTransformer,
	parsedRules: ParsedRules<Names>,
): ParsedRules<Names> {
	const ret = {} as Record<Names, ASTNode>
	for (const name in parsedRules) {
		ret[name] = fn(parsedRules[name])
	}

	return ret as ParsedRules<Names>
}

/**
 * Apply a transform function on children. Not recursive.
 */
export const traverseASTNode: TraverseFunction<NodeKind> = (fn, node) => {
	node = traverseSourceMap(fn, node)
	switch (node.nodeKind) {
		case 'rule':
			return traverseRuleNode(fn, node)
		case 'reference':
		case 'constant':
			return node
		case 'arrondi':
			return traverseArrondiNode(fn, node)
		case 'simplifier unité':
		case 'variable manquante':
		case 'est non applicable':
		case 'est non défini':
			return traverseUnaryOperationNode(fn, node)
		case 'barème':
		case 'taux progressif':
		case 'grille':
			return traverseNodeWithTranches(fn, node)
		case 'une possibilité':
			return traverseArrayNode(fn, node)
		case 'durée':
			return traverseDuréeNode(fn, node)
		case 'résoudre référence circulaire':
			return traverseRésoudreRéférenceCirculaireNode(fn, node)
		case 'inversion':
			return traverseInversionNode(fn, node)
		case 'operation':
			return traverseOperationNode(fn, node)

		case 'contexte':
			return traverseContexteNode(fn, node)
		case 'unité':
			return traverseUnitéNode(fn, node)
		case 'variations':
			return traverseVariationNode(fn, node)
		case 'replacementRule':
			return traverseReplacementNode(fn, node)
		case 'texte':
			return traverseTextNode(fn, node)
		case 'condition':
			return traverseConditionNode(fn, node)

		default:
			throw new UnreachableCaseError(node)
	}
}

const traverseSourceMap: TraverseFunction<NodeKind> = (fn, node) => {
	if (!('sourceMap' in node) || !node.sourceMap || !node.sourceMap.args) {
		return node
	}
	const sourceMap = node.sourceMap

	const args = {}
	for (const key in sourceMap.args) {
		const value = sourceMap.args[key]
		args[key] = Array.isArray(value) ? value.map((v) => fn(v)) : fn(value)
	}

	return {
		...node,
		sourceMap: {
			...sourceMap,
			args,
		},
	}
}

const traverseRuleNode: TraverseFunction<'rule'> = (fn, node) => {
	const copy = weakCopyObj(node)
	copy.suggestions = {}
	for (const key in node.suggestions) {
		copy.suggestions[key] = fn(node.suggestions[key])
	}
	copy.replacements = node.replacements.map(fn) as Array<ReplacementRule>
	copy.explanation = {
		ruleDisabledByItsParent: node.explanation.ruleDisabledByItsParent,
		nullableParent:
			node.explanation.nullableParent ?
				fn(node.explanation.nullableParent)
			:	undefined,
		parents: node.explanation.parents.map(fn),
		valeur: fn(node.explanation.valeur),
	}

	return copy
}

const traverseReplacementNode: TraverseFunction<'replacementRule'> = (
	fn,
	node,
) =>
	({
		...node,
		definitionRule: fn(node.definitionRule),
		replacedReference: fn(node.replacedReference),
		whiteListedNames: node.whiteListedNames.map(fn),
		blackListedNames: node.blackListedNames.map(fn),
	}) as ReplacementRule

const traverseUnaryOperationNode: TraverseFunction<
	| 'simplifier unité'
	| 'est non applicable'
	| 'est non défini'
	| 'variable manquante'
> = (fn, node) => ({
	...node,
	explanation: fn(node.explanation),
})

function traverseTranche(fn: (n: ASTNode) => ASTNode, tranches: TrancheNodes) {
	return tranches.map((tranche) => ({
		...tranche,
		...(tranche.plafond && { plafond: fn(tranche.plafond) }),
		...('montant' in tranche && { montant: fn(tranche.montant) }),
		...('taux' in tranche && { taux: fn(tranche.taux) }),
	}))
}
const traverseNodeWithTranches: TraverseFunction<
	'barème' | 'taux progressif' | 'grille'
> = (fn, node) => ({
	...node,
	explanation: {
		assiette: fn(node.explanation.assiette),
		multiplicateur: fn(node.explanation.multiplicateur),
		tranches: traverseTranche(fn, node.explanation.tranches),
	},
})

const traverseArrayNode: TraverseFunction<'une possibilité'> = (fn, node) => ({
	...node,
	explanation: node.explanation.map(fn),
})

const traverseOperationNode: TraverseFunction<'operation'> = (fn, node) => {
	const copy = weakCopyObj(node)
	copy.explanation = [fn(node.explanation[0]), fn(node.explanation[1])]

	return copy
}

const traverseDuréeNode: TraverseFunction<'durée'> = (fn, node) => ({
	...node,
	explanation: {
		depuis: fn(node.explanation.depuis),
		"jusqu'à": fn(node.explanation["jusqu'à"]),
	},
})

const traverseInversionNode: TraverseFunction<'inversion'> = (fn, node) => ({
	...node,
	explanation: {
		...node.explanation,
		inversionCandidates: node.explanation.inversionCandidates.map(fn) as any, // TODO
	},
})

const traverseArrondiNode: TraverseFunction<'arrondi'> = (fn, node) => ({
	...node,
	explanation: {
		valeur: fn(node.explanation.valeur),
		arrondi: fn(node.explanation.arrondi),
	},
})

const traverseRésoudreRéférenceCirculaireNode: TraverseFunction<
	'résoudre référence circulaire'
> = (fn, node) => ({
	...node,
	explanation: {
		...node.explanation,
		valeur: fn(node.explanation.valeur),
	},
})

const traverseTextNode: TraverseFunction<'texte'> = (fn, node) => ({
	...node,
	explanation: node.explanation.map((element) =>
		typeof element === 'string' ? element : fn(element),
	),
})

const traverseContexteNode: TraverseFunction<'contexte'> = (fn, node) => ({
	...node,
	explanation: {
		...node.explanation,
		contexte: node.explanation.contexte.map(([name, value]) => [
			fn(name) as ReferenceNode,
			fn(value),
		]),
		node: fn(node.explanation.node),
	},
})

const traverseUnitéNode: TraverseFunction<'unité'> = (fn, node) => {
	const copy = weakCopyObj(node)
	copy.explanation = fn(node.explanation)

	return copy
}

const traverseVariationNode: TraverseFunction<'variations'> = (fn, node) => ({
	...node,
	explanation: node.explanation.map(({ condition, consequence }) => ({
		condition: fn(condition),
		consequence: consequence && fn(consequence),
	})),
})

const traverseConditionNode: TraverseFunction<'condition'> = (fn, node) => {
	const copy = weakCopyObj(node)
	copy.explanation = {
		si: fn(node.explanation.si),
		alors: fn(node.explanation.alors),
		sinon: fn(node.explanation.sinon),
	}

	return copy
}
