import Engine from '.'
import {
	ASTNode,
	EvaluatedNode,
	Evaluation,
	MissingVariables,
} from './AST/types'
import { warning } from './error'
import { mergeMissing } from './evaluation'
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
	valeur?: Record<string, unknown> | string
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
	type?: string
	'possiblement non applicable'?: 'oui'
	note?: string
	remplace?: RendNonApplicable | Array<RendNonApplicable>
	'rend non applicable'?: Remplace | Array<string>
	suggestions?: Record<string, string | number | Record<string, unknown>>
	références?: { [source: string]: string }
	API?: string
	avec?: Record<string, Rule>
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
		ruleDisabledByItsParent: boolean
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
		'dans la situation': {
			clé: dottedName,
			'possiblement non applicable': rawRule['possiblement non applicable'],
			'type par défaut':
				// TODO : this could be infered by a good type inference algorithm. And it should be documented.
				(!('type' in rawRule) && rawRule.question && !rawRule.unité) ||
				rawRule.type === 'booléen'
					? 'boolean'
					: ['paragraphe', 'texte'].includes(rawRule.type ?? '') ||
					  rawRule['une possibilité'] ||
					  rawRule.formule?.['une possibilité'] ||
					  rawRule.valeur?.['une possibilité']
					? 'string'
					: 'number',
		},
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

	Object.entries(rawRule.avec ?? {}).forEach(([name, rule]) =>
		parse(
			rule == undefined
				? {
						nom: name,
				  }
				: typeof rule === 'object'
				? { ...rule, nom: name }
				: { valeur: rule, nom: name },
			ruleContext
		)
	)
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
	const { ruleDisabledByItsParent, nullableParent, parentMissingVariables } =
		evaluateDisablingParent(this, node)

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
			} as EvaluatedNode
		} else {
			this.cache._meta.evaluationRuleStack.unshift(node.dottedName)
			valeurEvaluation = this.evaluate(node.explanation.valeur)
			this.cache._meta.evaluationRuleStack.shift()
		}
	}

	const evaluation = {
		...valeurEvaluation,
		missingVariables: mergeMissing(
			valeurEvaluation.missingVariables,
			parentMissingVariables
		),
		...node,
		explanation: {
			parents: node.explanation.parents,
			valeur: valeurEvaluation,
			nullableParent,
			ruleDisabledByItsParent,
		},
	}

	return evaluation
})

export function evaluateDisablingParent(
	engine: Engine,
	node: RuleNode
): {
	ruleDisabledByItsParent: boolean
	parentMissingVariables: MissingVariables
	nullableParent?: ASTNode
} {
	const nullableParent = node.explanation.parents.find(
		(ref) =>
			engine.ruleUnits.get(ref)?.isNullable ||
			engine.ruleUnits.get(ref)?.type === 'boolean'
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
		let parentIsNotApplicable = {
			nodeValue: false as Evaluation,
			missingVariables: {},
		}
		if (engine.ruleUnits.get(nullableParent)?.isNullable) {
			parentIsNotApplicable = engine.evaluate({
				nodeKind: 'est non applicable',
				explanation: nullableParent,
			})
		}
		if (
			parentIsNotApplicable.nodeValue !== true &&
			engine.ruleUnits.get(nullableParent)?.type === 'boolean'
		) {
			parentIsNotApplicable = engine.evaluate({
				nodeKind: 'operation',
				operationKind: '=',
				explanation: [
					nullableParent,
					{ constant: { nodeValue: false, type: 'boolean' } },
				],
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

	if (engine.ruleUnits.get(nullableParent)?.type === 'boolean') {
		const parentEvaluation = engine.evaluate(nullableParent)
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
