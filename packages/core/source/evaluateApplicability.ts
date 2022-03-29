// TODO: Split this logic in each separate mechanism. We need a better mechanism
// API to register parse / evaluate / evaluate applicability (optionnal) / unit
// inference
import Engine, { ASTNode } from './index'
import { type RuleNode } from './rule'

// TODO: This could be implemented as a mechanism.
export function isApplicable(this: Engine, node: ASTNode): boolean {
	if (this.ruleUnits.get(node)?.isNullable === false) {
		return true
	} else if (this.cache.nodes.has(node)) {
		return this.cache.nodes.get(node)?.nodeValue !== null
	}
	switch (node.nodeKind) {
		case 'rule':
			const { ruleDisabledByItsParent } = evaluateDisablingParent(this, node)
			if (ruleDisabledByItsParent) {
				return false
			}
			return this.isApplicable(node.explanation.valeur)

		case 'reference':
			if (!node.dottedName) {
				throw new Error('Missing dottedName')
			}
			return this.isApplicable(this.parsedRules[node.dottedName])

		case 'applicable si':
			const condition = this.evaluate(node.explanation.condition)
			if (condition.nodeValue === false || condition.nodeValue === null) {
				return false
			}
			return this.isApplicable(node.explanation.valeur)

		case 'non applicable si':
			const negCondition = this.evaluate(node.explanation.condition)
			if (negCondition.nodeValue !== false && negCondition.nodeValue !== null) {
				return false
			}
			return this.isApplicable(node.explanation.valeur)

		case 'nom dans la situation':
			return this.isApplicable(node.explanation.valeur)
	}
	return this.evaluate(node).nodeValue !== null
}

export function evaluateDisablingParent(
	engine: Engine,
	node: RuleNode
): {
	ruleDisabledByItsParent: boolean
	nullableParent?: ASTNode
} {
	const nullableParent = node.explanation.parents.find(
		(ref) => engine.ruleUnits.get(ref)?.isNullable
	)

	if (!nullableParent) {
		return { ruleDisabledByItsParent: false }
	}

	if (
		// TODO: remove this condition and the associated "parentRuleStack", cycles
		// should be detected and avoided at parse time.
		!engine.cache._meta.parentRuleStack.includes(node.dottedName)
	) {
		engine.cache._meta.parentRuleStack.unshift(node.dottedName)
		const parentIsApplicable = engine.isApplicable(nullableParent)
		engine.cache._meta.parentRuleStack.shift()
		if (!parentIsApplicable) {
			return {
				ruleDisabledByItsParent: true,
				nullableParent,
			}
		}
	}

	if (engine.ruleUnits.get(nullableParent)?.type === 'boolean') {
		const parentEvaluation = engine.evaluate(nullableParent)
		return {
			ruleDisabledByItsParent: parentEvaluation.nodeValue === false,
			nullableParent,
		}
	}

	return {
		ruleDisabledByItsParent: false,
		nullableParent,
	}
}
