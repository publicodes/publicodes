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
		parents: Array<ASTNode>
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

	if (context.parsedRules[dottedName]) {
		return context.parsedRules[dottedName] as any
	}

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
		// We include a list of references to the parents to implement the branch
		// desactivation feature. When evaluating a rule we only need to know the
		// first nullable parent, but this is something that we can't determine at
		// this stage :
		// - we need to run remplacements (which works on references in the ASTs
		//   which is why we insert these “virtual” references)
		// - we need to infer unit of the rules
		//
		// An alternative implementation would be possible that would colocate the
		// code related to branch desactivation (ie find the first nullable parent
		// statically after rules parsing)
		parents: ruleParents(dottedName).map((parent) =>
			parse(parent, { ...context, circularReferences: true })
		),
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
	const firstNullableParent = node.explanation.parents.find(
		(ref) => this.ruleUnits.get(ref)?.isNullable
	)

	let nullableParentEvaluation = {
		nodeValue: undefined,
		missingVariables: {},
	} as EvaluatedNode

	if (
		firstNullableParent &&
		// TODO: remove this condition and the associated "parentRuleStack", cycles
		// should be detected and avoided at parse time.
		!this.cache._meta.parentRuleStack.includes(node.dottedName)
	) {
		this.cache._meta.parentRuleStack.unshift(node.dottedName)
		nullableParentEvaluation = this.evaluate(firstNullableParent)
		this.cache._meta.parentRuleStack.shift()
	}

	const ruleDisabledByItsParent =
		nullableParentEvaluation.nodeValue === null ||
		nullableParentEvaluation.nodeValue === false

	let valeurEvaluation: EvaluatedNode = {
		...node.explanation.valeur,
		nodeValue: null,
		missingVariables: {},
	}

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

			valeurEvaluation = {
				nodeValue: undefined,
				missingVariables: {},
			} as EvaluatedNode
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
			parents: node.explanation.parents,
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
