// TODO: Split this logic in each separate mechanism. We need a better mechanism
// API to register parse / evaluate / evaluate applicability (optionnal) / unit
// inference
import Engine, { ASTNode, EvaluatedNode } from './index'
import { type RuleNode } from './rule'

type isApplicableOptions = {
	/**
	 * Generally speaking a node is applicable if and only if its node value is
	 * not `null`. However we designed the branch desactivation feature in a way
	 * that accept boolean parents to disable children node.
	 *
	 * With the following option a node with a boolean value of `false` will be
	 * interpreted as not applicable.
	 *
	 * Its questionable whether this is a good design decision and this option
	 * should be avoided by external users.
	 */
	booleanNodeValueAsApplicability?: boolean
}

// TODO: This could be implemented as a mechanism.
export function isApplicable(
	this: Engine,
	node: ASTNode,
	{ booleanNodeValueAsApplicability = false }: isApplicableOptions = {}
): boolean {
	const recurse = (n: ASTNode) =>
		isApplicable.call(this, n, { booleanNodeValueAsApplicability })

	const nodeValueIsApplicable = (nodeValue: EvaluatedNode['nodeValue']) =>
		nodeValue !== null &&
		(!booleanNodeValueAsApplicability || nodeValue !== false)

	if (this.ruleUnits.get(node)?.isNullable === false) {
		return true
	} else if (this.cache.nodes.has(node)) {
		return nodeValueIsApplicable(this.cache.nodes.get(node)?.nodeValue)
	}

	switch (node.nodeKind) {
		case 'rule':
			const { ruleDisabledByItsParent } = evaluateDisablingParent(this, node)
			if (ruleDisabledByItsParent) {
				return false
			}
			this.cache._meta.evaluationRuleStack.unshift(node.dottedName)
			const res = recurse(node.explanation.valeur)
			this.cache._meta.evaluationRuleStack.shift()
			return res

		case 'reference':
			if (!node.dottedName) {
				throw new Error('Missing dottedName')
			}

			this.cache._meta.traversedVariablesStack[0]?.add(node.dottedName)

			return recurse(this.parsedRules[node.dottedName])

		case 'applicable si':
			const condition = this.evaluate(node.explanation.condition)
			if (condition.nodeValue === false || condition.nodeValue === null) {
				return false
			}
			return recurse(node.explanation.valeur)

		case 'non applicable si':
			const negCondition = this.evaluate(node.explanation.condition)
			if (negCondition.nodeValue !== false && negCondition.nodeValue !== null) {
				return false
			}
			return recurse(node.explanation.valeur)

		case 'nom dans la situation':
			return recurse(node.explanation.valeur)
	}
	return nodeValueIsApplicable(this.evaluate(node).nodeValue)
}

export function evaluateDisablingParent(
	engine: Engine,
	node: RuleNode
): {
	ruleDisabledByItsParent: boolean
	nullableParent?: ASTNode
} {
	// To avoid applicability cycles or ambiguity where the applicability of a
	// parent depend on a child, and the applicability depend on its parent, we
	// disable branch desactivation if a child is referenced in a parent
	// applicability. TODO: Documentation
	const isReferencedByAParent = engine.cache._meta.evaluationRuleStack.some(
		(x) => node.dottedName.startsWith(x)
	)

	if (isReferencedByAParent) {
		return { ruleDisabledByItsParent: false }
	}

	const nullableParent = node.explanation.parents.find(
		(ref) => engine.ruleUnits.get(ref)?.isNullable
	)

	if (!nullableParent) {
		return { ruleDisabledByItsParent: false }
	}

	const parentIsApplicable = isApplicable.call(engine, nullableParent, {
		booleanNodeValueAsApplicability:
			engine.ruleUnits.get(nullableParent)?.type === 'boolean',
	})

	return {
		ruleDisabledByItsParent: !parentIsApplicable,
		nullableParent,
	}
}
