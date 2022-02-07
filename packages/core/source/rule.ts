import { ASTNode, EvaluatedNode } from './AST/types'
import { warning } from './error'
import { bonus, mergeMissing } from './evaluation'
import { registerEvaluationFunction } from './evaluationFunctions'
import { capitalise0 } from './format'
import parse, { mecanismKeys } from './parse'
import { Context } from './parsePublicodes'
import { ReferenceNode } from './reference'
import {
	parseRendNonApplicable,
	parseReplacements,
	ReplacementRule,
} from './replacement'
import { nameLeaf, ruleParents } from './ruleUtils'

export type Rule = {
	formule?: Record<string, unknown> | string
	question?: string
	description?: string
	unité?: string
	acronyme?: string
	exemples?: any
	nom: string
	résumé?: string
	icônes?: string
	titre?: string
	sévérité?: string
	cotisation?: {
		branche: string
	}
	type?: string
	note?: string
	remplace?: RendNonApplicable | Array<RendNonApplicable>
	'rend non applicable'?: Remplace | Array<string>
	suggestions?: Record<string, string | number | Record<string, unknown>>
	références?: { [source: string]: string }
	API?: string
	'identifiant court'?: string
}

type Remplace =
	| {
			règle: string
			par?: Record<string, unknown> | string | number
			dans?: Array<string> | string
			'sauf dans'?: Array<string> | string
	  }
	| string
type RendNonApplicable = Exclude<Remplace, { par: any }>

export type RuleNode = {
	dottedName: string
	title: string
	nodeKind: 'rule'
	virtualRule: boolean
	rawNode: Rule
	replacements: Array<ReplacementRule>
	explanation: {
		valeur: ASTNode
		nullableParent?: ASTNode
	}
	suggestions: Record<string, ASTNode>
	'identifiant court'?: string
}

export default function parseRule(
	rawRule: Rule,
	context: Context
): ReferenceNode {
	const dottedName = [context.dottedName, rawRule.nom]
		.filter(Boolean)
		.join(' . ')

	const name = nameLeaf(dottedName)
	const ruleTitle = capitalise0(
		rawRule['titre'] ??
			(context.ruleTitle ? `${context.ruleTitle} (${name})` : name)
	)

	if (context.parsedRules[dottedName]) {
		throw new Error(`La référence '${dottedName}' a déjà été définie`)
	}

	const ruleValue = {
		...Object.fromEntries(
			Object.entries(rawRule).filter(([key]) => mecanismKeys.includes(key))
		),
		...('formule' in rawRule && { valeur: rawRule.formule }),
		'nom dans la situation': dottedName,
	}

	const ruleContext = { ...context, dottedName, ruleTitle }

	// The following ensures that nested rules appears after the root rule when
	// iterating over parsedRule
	context.parsedRules[dottedName] = undefined as any

	const explanation = {
		valeur: parse(ruleValue, ruleContext),
	}

	context.parsedRules[dottedName] = {
		dottedName,
		replacements: [
			...parseRendNonApplicable(rawRule['rend non applicable'], ruleContext),
			...parseReplacements(rawRule.remplace, ruleContext),
		],
		title: ruleTitle,
		suggestions: Object.fromEntries(
			Object.entries(rawRule.suggestions ?? {}).map(([name, node]) => [
				name,
				parse(node, ruleContext),
			])
		),
		nodeKind: 'rule',
		explanation,
		rawNode: rawRule,
		virtualRule: !!context.dottedName,
	} as RuleNode

	// We return the parsedReference
	return parse(rawRule.nom, context) as ReferenceNode
}

registerEvaluationFunction('rule', function evaluate(node) {
	// The disablingParent should be determined at parse time (after dottedname
	// resolution), which has the good consequence of removing cycles from the AST.

	const nullableParentName = ruleParents(node.dottedName).find(
		(parentName) => this.ruleUnits[parentName]?.isNullable
	)

	const nullableParentEvaluation =
		nullableParentName &&
		!this.cache._meta.evaluationRuleStack.includes(nullableParentName)
			? this.evaluate(nullableParentName)
			: ({
					nodeValue: undefined,
					missingVariables: {},
			  } as EvaluatedNode)

	let valeurEvaluation: EvaluatedNode = {
		...node.explanation.valeur,
		nodeValue: null,
		missingVariables: {},
	}
	const ruleDisabledByItsParent = nullableParentEvaluation.nodeValue === null
	if (!ruleDisabledByItsParent) {
		if (
			this.cache._meta.evaluationRuleStack.filter(
				(dottedName) => dottedName === node.dottedName
			).length > 15
			// I don't know why this magic number, but below, cycle are
			// detected "too early", which leads to blank value in brut-net simulator
		) {
			warning(
				this.options.logger,
				node.dottedName,
				`
		Un cycle a été détecté dans lors de l'évaluation de cette règle.
		Par défaut cette règle sera évaluée à 'null'.

		Pour indiquer au moteur de résoudre la référence circulaire en trouvant le point fixe
		de la fonction, il vous suffit d'ajouter l'attribut suivant niveau de la règle :

		${node.dottedName}:
		"résoudre la référence circulaire: oui"
		...

		`
			)

			valeurEvaluation.nodeValue = undefined
		} else {
			this.cache._meta.evaluationRuleStack.unshift(node.dottedName)
			valeurEvaluation = this.evaluate(node.explanation.valeur)
			this.cache._meta.evaluationRuleStack.shift()
		}
	}

	const parentMissing = Object.keys(nullableParentEvaluation.missingVariables)
	const selfMissing = Object.keys(valeurEvaluation.missingVariables)

	const evaluation = {
		...node,
		explanation: {
			nullableParent: nullableParentEvaluation,
			valeur: valeurEvaluation,
		},
		nodeValue: valeurEvaluation.nodeValue,
		missingVariables: mergeMissing(
			valeurEvaluation.missingVariables,
			bonus(nullableParentEvaluation.missingVariables)
		),
		missing: {
			parent: parentMissing,
			self: selfMissing,
		},
		...(valeurEvaluation &&
			'unit' in valeurEvaluation && { unit: valeurEvaluation.unit }),
	}

	return evaluation
})
