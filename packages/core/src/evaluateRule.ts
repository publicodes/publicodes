import Engine, { RuleNode } from '.'
import { EvaluatedNode, MissingVariables } from './AST/types'
import { isAValidOption } from './engine/isAValidOption'
import { PublicodesError, warning } from './error'
import { registerEvaluationFunction } from './evaluationFunctions'
import { defaultNode, mergeMissing } from './evaluationUtils'
import { isAccessible } from './ruleUtils'

registerEvaluationFunction('rule', function (node) {
	const evaluation = cycleCheck('value', evaluateRule)
	const result = evaluation(this, node) as any

	return result
})

function evaluateRule<Name extends string>(
	engine: Engine<Name>,
	rule: RuleNode,
): EvaluatedNode<'rule'> {
	const { ruleDisabledByItsParent, nullableParent, parentMissingVariables } =
		evaluateDisablingParent(engine, rule)

	const explanation = {
		...rule.explanation,
		nullableParent,
		ruleDisabledByItsParent,
	}

	if (ruleDisabledByItsParent) {
		return {
			...rule,
			nodeValue: null,
			missingVariables: parentMissingVariables,
			explanation,
		}
	}

	const possibilities =
		rule.possibilities && engine.evaluateNode(rule.possibilities)

	if (possibilities?.nodeValue !== undefined) {
		return {
			...rule,
			...(possibilities.unit ? { unit: possibilities.unit } : {}),
			nodeValue: possibilities.nodeValue,
			missingVariables: mergeMissing(
				possibilities.missingVariables,
				parentMissingVariables,
			),
			possibilities,
		}
	}

	const valeurEvaluation = engine.evaluateNode(rule.explanation.valeur)

	valeurEvaluation.missingVariables ??= {}
	updateRuleMissingVariables(engine, rule, valeurEvaluation)

	if (
		possibilities &&
		engine.context.strict.checkPossibleValues &&
		!isAValidOption(engine, possibilities, valeurEvaluation)
	) {
		throw new PublicodesError(
			'EvaluationError',
			`La valeur de la règle ${rule.dottedName} n'est pas une des possibilités attendues`,
			{
				dottedName: rule.dottedName,
			},
		)
	}
	const unit = possibilities?.unit ?? valeurEvaluation.unit
	const missingVariables = mergeMissing(
		mergeMissing(
			possibilities?.missingVariables ?? {},
			valeurEvaluation.missingVariables,
		),
		parentMissingVariables,
	)
	return {
		...valeurEvaluation,
		...(unit ? { unit } : {}),
		missingVariables,
		...rule,
		possibilities,
		explanation: {
			parents: rule.explanation.parents,
			valeur: valeurEvaluation,
			nullableParent,
			ruleDisabledByItsParent,
		},
	}
}

/*
	We implement the terminal case for missing variables manually here as
	a rule is missing if it is undefined and has no other missing dependencies
*/
function updateRuleMissingVariables(
	engine: Engine,
	node: RuleNode,
	valeurEvaluation: EvaluatedNode,
): void {
	if (
		node.private === true ||
		!isAccessible(engine.context.parsedRules, '', node.dottedName)
	) {
		return
	}

	if (
		valeurEvaluation.nodeValue === undefined &&
		!Object.keys(valeurEvaluation.missingVariables).length
	) {
		valeurEvaluation.missingVariables[node.dottedName] = 1
	}

	return
}

// function evaluateDisablingParentCycle(
// 	engine: Engine,
// 	node: RuleNode,
// ): {
// 	ruleDisabledByItsParent: boolean
// 	parentMissingVariables: MissingVariables
// 	nullableParent?: ASTNode
// } {
// 	const evaluateDisablingParentCycleCheck = cycleCheck(
// 		'hasDisablingParent',
// 		evaluateDisablingParentRaw,
// 	)
// 	// return evaluateDisablingParentRaw(engine, node) as any
// 	return evaluateDisablingParentCycleCheck(engine, node) as any
// }

function evaluateDisablingParent(engine: Engine, node: RuleNode) {
	if (
		node.dottedName.endsWith('$SITUATION') ||
		node.dottedName.includes('$INTERNAL')
	) {
		// We do not need to check if a situation rule or internal rule is disabled by its parent
		return { ruleDisabledByItsParent: false, parentMissingVariables: {} }
	}

	const nodesTypes = engine.context.nodesTypes
	const nullableParent = node.explanation.parents.find(
		(ref) =>
			nodesTypes.get(ref)?.isNullable ||
			nodesTypes.get(ref)?.type === 'boolean',
	)

	if (!nullableParent) {
		return { ruleDisabledByItsParent: false, parentMissingVariables: {} }
	}

	let parentIsNotApplicable = defaultNode(false) as EvaluatedNode
	if (nodesTypes.get(nullableParent)?.isNullable) {
		parentIsNotApplicable = engine.evaluateNode({
			nodeKind: 'est non applicable',
			explanation: nullableParent,
		})
	}
	if (
		parentIsNotApplicable.nodeValue !== true &&
		nodesTypes.get(nullableParent)?.type === 'boolean'
	) {
		parentIsNotApplicable = engine.evaluateNode({
			nodeKind: 'operation',
			operator: '=',
			operationKind: '=',
			explanation: [nullableParent, defaultNode(false)],
		})
	}

	// this.cache._meta.parentRuleStack.shift()
	if (parentIsNotApplicable.nodeValue === true) {
		return {
			ruleDisabledByItsParent: true,
			parentMissingVariables: parentIsNotApplicable.missingVariables ?? {},
			nullableParent,
		}
	}
	// }

	let parentMissingVariables: MissingVariables = {}

	if (nodesTypes.get(nullableParent)?.type === 'boolean') {
		const parentEvaluation = engine.evaluateNode(nullableParent)
		parentMissingVariables = parentEvaluation.missingVariables ?? {}
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

type EvaluationType = 'value' | 'applicability' | 'hasDisablingParent'
function cycleCheck<R>(
	type: EvaluationType,
	evaluationFn: (engine: Engine, node: RuleNode) => R,
): (engine: Engine, node: RuleNode) => R {
	return function (engine: Engine, node) {
		if (engine.cache._meta.cyclicComponent.has(node.dottedName + type)) {
			return engine.cache._meta.cyclicComponent.get(
				node.dottedName + type,
			) as any
		}

		if (engine.cache._meta.evaluationSet.has(node.dottedName + type)) {
			const cycleIndex = engine.cache._meta.evaluationRuleStack.findIndex(
				(rule) => rule.dottedName === node.dottedName && rule.type === type,
			)
			const cycle = engine.cache._meta.evaluationRuleStack
				.slice(0, cycleIndex + 1)
				.reverse()

			// We supress the same rule each time to be sure that evaluation is idempotent
			const cycleRuleToSupress = cycle.toSorted(
				(a, b) =>
					// Rule with a.type === 'hasDisablingParent' should be considered first, then 'applicability' and finally 'value'
					(a.type === 'hasDisablingParent' ? -1
					: a.type === 'applicability' ? 0
					: 1) -
						(b.type === 'hasDisablingParent' ? -1
						: b.type === 'applicability' ? 0
						: 1) ||
					// Then rule whose namespace is the longest (deeper in the tree)
					b.dottedName.split(' . ').length - a.dottedName.split(' . ').length ||
					// Then lexicographically
					a.dottedName.localeCompare(b.dottedName),
			)[0]
			engine.cache._meta.cyclicComponent.set(
				cycleRuleToSupress.dottedName + cycleRuleToSupress.type,
				(type === 'value' ? defaultNode(undefined)
				: type === 'applicability' ?
					{
						nodeKind: 'est non applicable',
						nodeValue: false,
						explanation: defaultNode('Cycle détecté'),
						missingVariables: {},
					}
				:	{
						ruleDisabledByItsParent: false,
						parentMissingVariables: {},
					}) as any,
			)

			const message = `
Un cycle a été détecté lors de l'évaluation de cette règle:
${[...cycle, { dottedName: node.dottedName, type }]
	.map(
		({ dottedName, type }) =>
			`${dottedName}${
				type === 'applicability' ? ' [applicabilité]'
				: type === 'hasDisablingParent' ? ' [parent désactivant]'
				: ''
			}`,
	)
	.join(cycle.length > 5 ? '\n → ' : ' → ')}

${
	cycleRuleToSupress.type === 'value' ?
		`
Pour casser le cycle, la règle "${cycleRuleToSupress.dottedName}" a été considérée comme non définie ('undefined').


Si le cycle est voulu, vous pouvez indiquer au moteur de résoudre la référence circulaire en trouvant le point fixe de la fonction. Pour cela, ajoutez l'attribut suivant niveau de la règle :

	${node.dottedName}:
		résoudre la référence circulaire: oui"
		...
`
	: cycleRuleToSupress.type === 'applicability' ?
		`
Pour casser le cycle, la règle "${cycleRuleToSupress.dottedName}" a été évaluée comme applicable
`
	:	`
Pour casser le cycle, les parents de la règle "${cycleRuleToSupress.dottedName}" n'ont pas été évalués pour savoir si elle était désactivée
`
}`
			if (!message.includes('$SITUATION') && !message.includes('$INTERNAL')) {
				if (engine.context.strict.noCycleRuntime) {
					throw new PublicodesError('EvaluationError', message, {
						dottedName: node.dottedName,
					})
				}
				warning(engine.context.logger, message, { dottedName: node.dottedName })
			}
		}

		engine.cache._meta.evaluationRuleStack.unshift({
			dottedName: node.dottedName,
			type,
		})
		engine.cache._meta.evaluationSet.add(node.dottedName + type)
		const result = evaluationFn(engine, node)

		engine.cache._meta.evaluationSet.delete(node.dottedName + type)
		engine.cache._meta.evaluationRuleStack.shift()
		// supressCycleRule = isCycleRule(engine, type, node.dottedName)

		return result
	}
}

export function evaluateRuleApplicability(
	engine: Engine,
	rule: RuleNode,
): EvaluatedNode<'est non applicable'> {
	if (engine.cache.applicabilityCache.has(rule.dottedName)) {
		return engine.cache.applicabilityCache.get(rule.dottedName) as any
	}
	const evaluation = cycleCheck('applicability', evaluateRuleApplicabilityRaw)
	const result = evaluation(engine, rule) as any
	engine.cache.applicabilityCache.set(rule.dottedName, result)
	return result
}

function evaluateRuleApplicabilityRaw(
	engine: Engine,
	rule: RuleNode,
): EvaluatedNode<'est non applicable'> {
	const { ruleDisabledByItsParent, nullableParent, parentMissingVariables } =
		evaluateDisablingParent(engine, rule)

	if (ruleDisabledByItsParent) {
		return {
			nodeKind: 'est non applicable',
			nodeValue: true,
			explanation: nullableParent!,
			missingVariables: parentMissingVariables,
		}
	}

	const isNotApplicableEvaluation = engine.evaluateNode({
		nodeKind: 'est non applicable',
		explanation: rule.explanation.valeur,
	})

	const missingVariables = mergeMissing(
		parentMissingVariables,
		isNotApplicableEvaluation.missingVariables,
	)

	// If the rule can be disabled thought the situation, it should be listed inside the missing variables
	if (
		isNotApplicableEvaluation.nodeValue === false &&
		engine.context.nodesTypes.get(
			engine.context.parsedRules[`${rule.dottedName} . $SITUATION`],
		)?.isNullable &&
		!Object.keys(isNotApplicableEvaluation.missingVariables).length
	) {
		missingVariables[rule.dottedName] = 1
	}

	return {
		nodeKind: 'est non applicable',
		nodeValue: isNotApplicableEvaluation.nodeValue,
		explanation: isNotApplicableEvaluation.explanation,
		missingVariables,
	}
}
