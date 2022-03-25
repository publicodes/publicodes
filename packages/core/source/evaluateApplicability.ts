// TODO: Split this logic in each separate mechanism. We need a better mechanism
// API to register parse / evaluate / evaluate applicability (optionnal) / unit
// inference
import Engine, { ASTNode } from './index'
import { MissingVariables } from './AST/types'
import { type RuleNode } from './rule'

export function evaluateApplicability(
	this: Engine,
	node: ASTNode
): {
	isApplicable: boolean
	missingVariables: MissingVariables
} {
	if (this.ruleUnits.get(node)?.isNullable === false) {
		return { isApplicable: true, missingVariables: {} }
	}
	switch (node.nodeKind) {
		case 'rule':
			const { ruleDisabledByItsParent, parentMissingVariables } =
				evaluateDisablingParent(this, node)
			if (ruleDisabledByItsParent) {
				return {
					isApplicable: false,
					missingVariables: parentMissingVariables,
				}
			}
			return this.evaluateApplicability(node.explanation.valeur)

		case 'reference':
			if (!node.dottedName) {
				throw new Error('Missing dottedName')
			}
			return this.evaluateApplicability(this.parsedRules[node.dottedName])

		case 'applicable si':
			const condition = this.evaluate(node.explanation.condition)
			if (condition.nodeValue === false || condition.nodeValue === null) {
				return {
					isApplicable: false,
					missingVariables: condition.missingVariables,
				}
			}
			return this.evaluateApplicability(node.explanation.valeur)

		case 'non applicable si':
			const negCondition = this.evaluate(node.explanation.condition)
			if (negCondition.nodeValue !== false && negCondition.nodeValue !== null) {
				return {
					isApplicable: false,
					missingVariables: negCondition.missingVariables,
				}
			}
			return this.evaluateApplicability(node.explanation.valeur)

		case 'nom dans la situation':
			return this.evaluateApplicability(node.explanation.valeur)
	}
	return {
		isApplicable: this.evaluate(node).nodeValue !== null,
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

	let parentMissingVariables = {}

	if (
		// TODO: remove this condition and the associated "parentRuleStack", cycles
		// should be detected and avoided at parse time.
		!engine.cache._meta.parentRuleStack.includes(node.dottedName)
	) {
		engine.cache._meta.parentRuleStack.unshift(node.dottedName)
		const parentApplicability = engine.evaluateApplicability(nullableParent)
		engine.cache._meta.parentRuleStack.shift()
		if (!parentApplicability.isApplicable) {
			return {
				ruleDisabledByItsParent: true,
				parentMissingVariables: parentApplicability.missingVariables ?? {},
				nullableParent,
			}
		}
		parentMissingVariables = parentApplicability.missingVariables
	}

	if (engine.ruleUnits.get(nullableParent)?.type === 'boolean') {
		const parentEvaluation = engine.evaluate(nullableParent)
		return {
			ruleDisabledByItsParent: parentEvaluation.nodeValue === false,
			parentMissingVariables: parentEvaluation.missingVariables,
			nullableParent,
		}
	}

	return {
		ruleDisabledByItsParent: false,
		parentMissingVariables,
		nullableParent,
	}
}
