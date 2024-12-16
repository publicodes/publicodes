import Engine, { RawPublicodes } from '.'
import { ASTNode, EvaluatedNode, MissingVariables } from './AST/types'
import { isAValidOption } from './engine/isAValidOption'
import { PublicodesError, warning } from './error'
import { registerEvaluationFunction } from './evaluationFunctions'
import { defaultNode, mergeMissing, undefinedNode } from './evaluationUtils'
import { capitalise0 } from './format'
import {
	parseUnePossibilité,
	RulePossibilités,
	UnePossibilitéNode,
} from './mecanisms/unePossibilité'
import parse, { mecanismKeys } from './parse'
import { Context } from './parsePublicodes'
import {
	parseRendNonApplicable,
	parseReplacements,
	ReplacementRule,
} from './parseReplacement'
import { isAccessible, nameLeaf, ruleParents } from './ruleUtils'
import { weakCopyObj } from './utils'

export type Rule = {
	formule?: Record<string, unknown> | string | number
	valeur?: Record<string, unknown> | string | number
	question?: string
	description?: string
	unité?: string
	acronyme?: string
	exemples?: any
	résumé?: string
	icônes?: string
	titre?: string
	sévérité?: string
	experimental?: 'oui'
	'possiblement non applicable'?: 'oui'
	privé?: 'oui'
	note?: string
	'une possibilité'?: RulePossibilités
	remplace?: Remplace | Array<Remplace>
	'rend non applicable'?: Remplace | Array<Remplace>
	suggestions?: Record<string, string | number | Record<string, unknown>>
	références?: { [source: string]: string }
	API?: string
	'identifiant court'?: string
} & Record<string, unknown>

type Remplace =
	| {
			'références à': string
			dans?: Array<string> | string
			'sauf dans'?: Array<string> | string
			priorité?: number
	  }
	| string

export type RuleNode<Name extends string = string> = {
	dottedName: Name
	title: string
	nodeKind: 'rule'
	virtualRule: boolean
	private: boolean
	rawNode: Rule
	replacements: Array<ReplacementRule>
	possibilities: UnePossibilitéNode | undefined
	explanation: {
		valeur: ASTNode
		parents: Array<ASTNode>
		nullableParent?: ASTNode
		ruleDisabledByItsParent: boolean
	}
	suggestions: Record<string, ASTNode>
	'identifiant court'?: string
}

function parseRule(nom: string, rawRule: Rule, context: Context): RuleNode {
	const privateRule = rawRule.privé === 'oui' || nom.startsWith('[privé] ')
	nom = nom.replace(/^\[privé\] /, '')
	const dottedName = [context.dottedName, nom].filter(Boolean).join(' . ')

	const name = nameLeaf(dottedName)
	const title = capitalise0(rawRule['titre'] ?? name)

	if (context.parsedRules[dottedName]) {
		throw new PublicodesError(
			'EvaluationError',
			`La référence '${dottedName}' a déjà été définie`,
			{ dottedName },
		)
	}

	const currentDottedNameContext = context.dottedName
	context.dottedName = dottedName

	// The following ensures that nested rules appears after the root rule when
	// iterating over parsedRule
	context.parsedRules[dottedName] = undefined as any

	const ruleValue: Record<string, unknown> = {}

	ruleValue.avec = Object.assign({}, rawRule.avec)
	const possibilities = parseUnePossibilité(
		rawRule,
		context,
		ruleValue.avec as Record<string, Rule>,
	)

	for (const key in rawRule) {
		if (mecanismKeys.includes(key)) {
			ruleValue[key] ??= rawRule[key]
		}
	}

	if ('formule' in rawRule) {
		ruleValue.valeur = rawRule.formule
	}

	if (!privateRule && !dottedName.endsWith('$SITUATION')) {
		// We create a $SITUATION child rule for each rule that is not private
		// This value will be used to evaluate the rule in the current situation (`setSituation`)
		ruleValue['dans la situation'] = `${dottedName} . $SITUATION`

		const situationValue = weakCopyObj(undefinedNode)
		situationValue.isNullable = rawRule['possiblement non applicable'] === 'oui'
		;(ruleValue['avec'] as Record<string, any>)['[privé] $SITUATION'] = {
			valeur: situationValue,
		}

		// If the `par défaut` value is used, then the rule should be listed as a missingVariables
		if (ruleValue['par défaut'] != null) {
			ruleValue['par défaut'] = {
				valeur: ruleValue['par défaut'],
				'variable manquante': dottedName,
			}
		}
	}

	// Parse possible choices
	const explanation = {
		valeur: parse(ruleValue, context),
		/*
		We include a list of references to the parents to implement the branch
		desactivation feature. When evaluating a rule we only need to know the
		first nullable parent, but this is something that we can't determine at
		this stage :
		- we need to run remplacements (which works on references in the ASTs
		  which is why we insert these “virtual” references)
		- we need to infer unit of the rules
		
		An alternative implementation would be possible that would colocate the
		code related to branch desactivation (ie find the first nullable parent
		statically after rules parsing)
		*/
		parents: ruleParents(dottedName).map(
			(parent) =>
				({
					dottedName: parent,
					nodeKind: 'reference',
					contextDottedName: context.dottedName,
				}) as ASTNode<'reference'>,
		),
	}

	const suggestions = {} as Record<string, ASTNode>
	if (rawRule.suggestions) {
		for (const name in rawRule.suggestions) {
			suggestions[name] = parse(rawRule.suggestions[name], context)
		}
	}

	context.parsedRules[dottedName] = {
		dottedName,
		replacements: [
			...parseRendNonApplicable(rawRule['rend non applicable'], context),
			...parseReplacements(rawRule.remplace, context),
		],
		title: title,
		private: privateRule,
		suggestions,
		nodeKind: 'rule',
		possibilities,
		explanation,
		rawNode: rawRule,
		virtualRule: privateRule,
	} as RuleNode

	context.dottedName = currentDottedNameContext
	return context.parsedRules[dottedName]
}

export function parseRules<RuleNames extends string>(
	rules: RawPublicodes<RuleNames>,
	context: Context,
) {
	for (const dottedName in rules) {
		let rule = rules[dottedName]

		if (typeof rule === 'string' || typeof rule === 'number') {
			rule = { valeur: `${rule}` }
		}
		if (typeof rule !== 'object') {
			throw new PublicodesError(
				'SyntaxError',
				`Rule ${dottedName} is incorrectly written. Please give it a proper value.\n ${rule}`,
				{ dottedName },
			)
		}
		const copy = rule === null ? {} : weakCopyObj(rule)
		parseRule(dottedName, copy as Rule, context)
	}
}

registerEvaluationFunction('rule', function evaluate(node) {
	const { ruleDisabledByItsParent, nullableParent, parentMissingVariables } =
		evaluateDisablingParent(this, node)

	const explanation = {
		...node.explanation,
		nullableParent,
		ruleDisabledByItsParent,
	}
	if (ruleDisabledByItsParent) {
		return {
			...node,
			nodeValue: null,
			missingVariables: parentMissingVariables,
			explanation,
		}
	}

	if (
		this.cache._meta.evaluationRuleStack.filter(
			(dottedName) => dottedName === node.dottedName,
		).length > 1
	) {
		const cycleIndex = this.cache._meta.evaluationRuleStack.indexOf(
			node.dottedName,
		)
		const cycle = [
			...this.cache._meta.evaluationRuleStack
				.slice(0, cycleIndex + 1)
				.reverse(),
			node.dottedName,
		]
		const message = `
Un cycle a été détecté lors de l'évaluation de cette règle:
${cycle.join(cycle.length > 5 ? '\n → ' : ' → ')}

Cela vient probablement d'une erreur dans votre modèle.

Si le cycle est voulu, vous pouvez indiquer au moteur de résoudre la référence circulaire en trouvant le point fixe de la fonction. Pour cela, ajoutez l'attribut suivant niveau de la règle :

	${node.dottedName}:
		résoudre la référence circulaire: oui"
		...
`

		// Do not warn if the cycle is due to a rule being disabled by its parent (see https://github.com/publicodes/publicodes/issues/206 for the proper way of doing it)
		if (
			!this.cache._meta.parentRuleStack.length ||
			this.cache._meta.parentRuleStack.some(
				(dottedName) => !dottedName.startsWith(node.dottedName),
			)
		) {
			if (this.context.strict.noCycleRuntime) {
				throw new PublicodesError('EvaluationError', message, {
					dottedName: node.dottedName,
				})
			}
			warning(this.context.logger, message, { dottedName: node.dottedName })
		}

		return {
			...node,
			nodeValue: undefined,
			missingVariables: parentMissingVariables,
			explanation,
		}
	}

	this.cache._meta.evaluationRuleStack.unshift(node.dottedName)

	const possibilities =
		node.possibilities && this.evaluateNode(node.possibilities)

	if (possibilities?.nodeValue !== undefined) {
		return {
			...node,
			...(possibilities.unit ? { unit: possibilities.unit } : {}),
			nodeValue: possibilities.nodeValue,
			missingVariables: mergeMissing(
				possibilities.missingVariables,
				parentMissingVariables,
			),
			possibilities,
		}
	}

	const valeurEvaluation = this.evaluateNode(node.explanation.valeur)
	this.cache._meta.evaluationRuleStack.shift()

	valeurEvaluation.missingVariables ??= {}
	updateRuleMissingVariables(this, node, valeurEvaluation)

	if (
		possibilities &&
		this.context.strict.checkPossibleValues &&
		!isAValidOption(this, possibilities, valeurEvaluation)
	) {
		throw new PublicodesError(
			'EvaluationError',
			`La valeur de la règle ${node.dottedName} n'est pas une des possibilités attendues`,
			{
				dottedName: node.dottedName,
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
		...node,
		possibilities,
		explanation: {
			parents: node.explanation.parents,
			valeur: valeurEvaluation,
			nullableParent,
			ruleDisabledByItsParent,
		},
	}
})

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

export function evaluateDisablingParent(
	engine: Engine,
	node: RuleNode,
): {
	ruleDisabledByItsParent: boolean
	parentMissingVariables: MissingVariables
	nullableParent?: ASTNode
} {
	if (node.private) {
		// We do not need to check if a private rule is disabled by its parent :
		// they are accessible only from its sibling or parent
		// (which would already be disabled)
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

	if (
		// TODO: remove this condition and the associated "parentRuleStack", cycles
		// should be detected and avoided at parse time.
		!engine.cache._meta.parentRuleStack.includes(node.dottedName)
	) {
		engine.cache._meta.parentRuleStack.unshift(node.dottedName)
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

		engine.cache._meta.parentRuleStack.shift()
		if (parentIsNotApplicable.nodeValue === true) {
			return {
				ruleDisabledByItsParent: true,
				parentMissingVariables: parentIsNotApplicable.missingVariables ?? {},
				nullableParent,
			}
		}
	}

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
