import { ASTNode, EvaluatedNode } from '.'

export function computeTraversedVariableBeforeEval(
	traversedVariablesStack: Array<Set<string>> | undefined,
	parsedNode: ASTNode,
	cachedNode: EvaluatedNode | undefined,
	publicParsedRules: Record<string, ASTNode>,
	isTraversedVariablesBoundary: boolean,
) {
	if (traversedVariablesStack === undefined) {
		return
	}
	if (cachedNode !== undefined) {
		cachedNode.traversedVariables?.forEach(
			(name) => traversedVariablesStack[0]?.add(name),
		)
		return
	}

	if (isTraversedVariablesBoundary) {
		// Note: we use `unshift` instead of the more usual `push` to reverse the
		// order of the elements in the stack. This simplify access to the “top
		// element” with [0], instead of [length - 1]. We could also use the new
		// method `.at(-1)` but it isn't supported below Node v16.
		traversedVariablesStack.unshift(new Set())
	}

	if (
		parsedNode.nodeKind === 'reference' &&
		parsedNode.dottedName &&
		parsedNode.dottedName in publicParsedRules
	) {
		traversedVariablesStack[0].add(parsedNode.dottedName)
	}
}

export function isTraversedVariablesBoundary(
	traversedVariablesStack: Array<Set<string>> | undefined,
	parsedNode: ASTNode,
) {
	return (
		!!traversedVariablesStack &&
		(traversedVariablesStack.length === 0 || parsedNode.nodeKind === 'rule')
	)
}

export function computeTraversedVariableAfterEval(
	traversedVariablesStack: Array<Set<string>> | undefined,
	evaluatedNode: EvaluatedNode,
	isTraversedVariablesBoundary: boolean,
) {
	if (traversedVariablesStack === undefined) {
		return
	}
	if (isTraversedVariablesBoundary) {
		evaluatedNode.traversedVariables = Array.from(
			traversedVariablesStack.shift() ?? [],
		)

		if (traversedVariablesStack.length > 0) {
			evaluatedNode.traversedVariables.forEach((name) => {
				traversedVariablesStack[0].add(name)
			})
		}
	}
}
