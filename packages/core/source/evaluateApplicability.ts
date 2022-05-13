// TODO: Split this logic in each separate mechanism. We need a better mechanism
// API to register parse / evaluate / evaluate applicability (optionnal) / unit
// inference
import { MissingVariables } from './AST/types'
import { bonus, mergeMissing } from './evaluation'
import Engine, { ASTNode } from './index'
import { type RuleNode } from './rule'

// TODO: This could be implemented as a mechanism.
export function isApplicable(
	this: Engine,
	node: ASTNode
): { nodeValue: boolean; missingVariables: MissingVariables } {
	if (this.ruleUnits.get(node)?.isNullable === false) {
		return { nodeValue: true, missingVariables: {} }
	} else if (this.cache.nodes.has(node)) {
		return {
			nodeValue: this.cache.nodes.get(node)?.nodeValue !== null,
			missingVariables: this.cache.nodes.get(node)?.missingVariables ?? {},
		}
	}
	switch (node.nodeKind) {
		case 'rule':
			const { ruleDisabledByItsParent, parentMissingVariables } =
				evaluateDisablingParent(this, node)
			if (ruleDisabledByItsParent) {
				return { nodeValue: false, missingVariables: parentMissingVariables }
			}
			return {
				nodeValue: this.isApplicable(node.explanation.valeur).nodeValue,
				missingVariables: mergeMissing(
					bonus(parentMissingVariables),
					this.isApplicable(node.explanation.valeur).missingVariables
				),
			}

		case 'reference':
			if (!node.dottedName) {
				throw new Error('Missing dottedName')
			}
			return this.isApplicable(this.parsedRules[node.dottedName])

		case 'applicable si':
			const condition = this.evaluate(node.explanation.condition)
			if (condition.nodeValue === false || condition.nodeValue === null) {
				return {
					nodeValue: false,
					missingVariables: condition.missingVariables,
				}
			}
			return {
				nodeValue: this.isApplicable(node.explanation.valeur).nodeValue,
				missingVariables: mergeMissing(
					bonus(condition.missingVariables),
					this.isApplicable(node.explanation.valeur).missingVariables
				),
			}

		case 'non applicable si':
			const negCondition = this.evaluate(node.explanation.condition)
			if (negCondition.nodeValue !== false && negCondition.nodeValue !== null) {
				return {
					nodeValue: false,
					missingVariables: negCondition.missingVariables,
				}
			}
			return {
				nodeValue: this.isApplicable(node.explanation.valeur).nodeValue,
				missingVariables: mergeMissing(
					bonus(negCondition.missingVariables),
					this.isApplicable(node.explanation.valeur).missingVariables
				),
			}

		case 'nom dans la situation':
			return this.isApplicable(node.explanation.valeur)
	}
	return {
		nodeValue: this.evaluate(node).nodeValue !== null,
		missingVariables: this.evaluate(node).missingVariables,
	}
}

export function evaluateDisablingParent(
	engine: Engine,
	node: RuleNode
): {
	ruleDisabledByItsParent: boolean
	parentMissingVariables: MissingVariables
	nullableParent?: ASTNode
} {
	const nullableParent = node.explanation.parents.find(
		(ref) => engine.ruleUnits.get(ref)?.isNullable
	)

	if (!nullableParent) {
		return { ruleDisabledByItsParent: false, parentMissingVariables: {} }
	}

	if (
		// TODO: remove this condition and the associated "parentRuleStack", cycles
		// should be detected and avoided at parse time.
		!engine.cache._meta.parentRuleStack.includes(node.dottedName)
	) {
		engine.cache._meta.parentRuleStack.unshift(node.dottedName)
		const { nodeValue: parentIsApplicable, missingVariables } =
			engine.isApplicable(nullableParent)
		engine.cache._meta.parentRuleStack.shift()
		if (!parentIsApplicable) {
			return {
				ruleDisabledByItsParent: true,
				parentMissingVariables: missingVariables,
				nullableParent,
			}
		}
	}

	let parentMissingVariables = {}

	if (engine.ruleUnits.get(nullableParent)?.type === 'boolean') {
		const parentEvaluation = engine.evaluate(nullableParent)
		parentMissingVariables = parentEvaluation.missingVariables
		return {
			ruleDisabledByItsParent: parentEvaluation.nodeValue === false,
			parentMissingVariables,
			nullableParent,
		}
	}

	return {
		ruleDisabledByItsParent: false,
		parentMissingVariables,
		nullableParent,
	}
}
