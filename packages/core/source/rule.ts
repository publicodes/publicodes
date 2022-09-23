import Engine from '.'
import { ASTNode, EvaluatedNode, MissingVariables } from './AST/types'
import { PublicodesError } from './error'
import { registerEvaluationFunction } from './evaluationFunctions'
import { defaultNode, mergeMissing } from './evaluationUtils'
import { capitalise0 } from './format'
import { undefinedNode } from './mecanisms/inlineMecanism'
import parse, { mecanismKeys } from './parse'
import { Context } from './parsePublicodes'
import { ReferenceNode } from './reference'
import {
	parseRendNonApplicable,
	parseReplacements,
	ReplacementRule,
} from './replacement'
import { isAccessible, nameLeaf, ruleParents } from './ruleUtils'

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
	experimental?: 'oui'
	'possiblement non applicable'?: 'oui'
	privé?: 'oui'
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

export type RuleNode<Name extends string = string> = {
	dottedName: Name
	title: string
	nodeKind: 'rule'
	virtualRule: boolean
	private: boolean
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
): ReferenceNode | RuleNode {
	const privateRule = !!(
		rawRule.privé === 'oui' || rawRule.nom.startsWith('[privé] ')
	)
	const nom = rawRule.nom.replace(/^\[privé\] /, '')
	const dottedName = [context.dottedName, nom].filter(Boolean).join(' . ')

	const name = nameLeaf(dottedName)
	const title = capitalise0(rawRule['titre'] ?? name)

	if (context.parsedRules[dottedName]) {
		throw new PublicodesError(
			'EvaluationError',
			`La référence '${dottedName}' a déjà été définie`,
			{ dottedName }
		)
	}

	const ruleValue: Record<string, unknown> = {
		...Object.fromEntries(
			Object.entries(rawRule).filter(([key]) => mecanismKeys.includes(key))
		),
		...('formule' in rawRule && { valeur: rawRule.formule }),
	}

	if (!privateRule && !dottedName.endsWith('$SITUATION')) {
		// We create a $SITUATION child rule
		ruleValue['dans la situation'] = `${dottedName} . $SITUATION`
		ruleValue['avec'] = {
			...((ruleValue.avec as object) ?? {}),
			'[privé] $SITUATION': {
				...undefinedNode,
				isNullable: rawRule['possiblement non applicable'] === 'oui',
			},
		}

		// If the `par défaut` value is used, then the rule should be listed as a missingVariables
		if (ruleValue['par défaut'] != null) {
			ruleValue['par défaut'] = {
				valeur: ruleValue['par défaut'],
				'variable manquante': dottedName,
			}
		}
	}
	const ruleContext = { ...context, dottedName }

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
		parents: ruleParents(dottedName)
			.map((parent) => parse(parent, ruleContext))
			.map(
				// This step ensure we skip the disambiguation step.
				// This prevents to inadequatly disambiguate a parent as a children of rule (for instance if we have `a . b` and `a . b . a` rules).
				// It's necessary while https://github.com/betagouv/publicodes/issues/253 is not implemented
				(n) => ({ ...n, dottedName: (n as ReferenceNode).name })
			),
	}

	context.parsedRules[dottedName] = {
		dottedName,
		replacements: [
			...parseRendNonApplicable(rawRule['rend non applicable'], ruleContext),
			...parseReplacements(rawRule.remplace, ruleContext),
		],
		title: title,
		private: privateRule,
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
	return !!context.dottedName
		? (parse(nom, context) as ReferenceNode)
		: context.parsedRules[dottedName]
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
			).length > 1
		) {
			//  TODO : remettre ce warning. Je ne sais pas pourquoi, mais la base de règle de mon-entreprise lève un warning sur quasiment toutes les cotisations
			// 			warning(
			// 				this.context.logger,
			// 				`Un cycle a été détecté lors de l'évaluation de cette règle.

			// Par défaut cette règle sera évaluée à 'null'.
			// Pour indiquer au moteur de résoudre la référence circulaire en trouvant le point fixe
			// de la fonction, il vous suffit d'ajouter l'attribut suivant niveau de la règle :

			// 	${node.dottedName}:
			// 		résoudre la référence circulaire: oui"
			// 		...
			// `,
			// 				{ dottedName: node.dottedName }
			// 			)

			valeurEvaluation = {
				nodeValue: undefined,
			} as EvaluatedNode
		} else {
			this.cache._meta.evaluationRuleStack.unshift(node.dottedName)
			valeurEvaluation = this.evaluateNode(node.explanation.valeur)
			this.cache._meta.evaluationRuleStack.shift()
		}
	}
	valeurEvaluation.missingVariables ??= {}
	updateRuleMissingVariables(this, node, valeurEvaluation)
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

/* 
	We implement the terminal case for missing variables manually here as
	a rule is missing if it is undefined and has no other missing dependencies
*/
function updateRuleMissingVariables(
	engine: Engine,
	node: RuleNode,
	valeurEvaluation: EvaluatedNode
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
	node: RuleNode
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
			nodesTypes.get(ref)?.isNullable || nodesTypes.get(ref)?.type === 'boolean'
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
