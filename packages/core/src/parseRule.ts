import { RawPublicodes } from '.'
import { ASTNode } from './AST/types'
import { PublicodesError } from './error'
import { undefinedNode } from './evaluationUtils'
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
import { nameLeaf, ruleParents } from './ruleUtils'
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
