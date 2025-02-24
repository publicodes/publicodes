import { PublicodesError, serializeUnit } from '..'
import { ASTNode, EvaluatedNode, Unit } from '../AST/types'
import { warning } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { mergeAllMissing } from '../evaluationUtils'
import { parsePossibilité, Possibility } from '../parsePossibilité'
import { Context } from '../parsePublicodes'
import { Rule } from '../parseRule'
import { convertUnit } from '../units'
import { weakCopyObj } from '../utils'

export type RulePossibilités =
	| Array<string | Record<string, Rule>>
	| { possibilités: Array<string | Record<string, Rule>> }

export type UnePossibilitéNode = {
	nodeKind: 'une possibilité'
	type: 'number' | 'string' | 'reference'
	unit?: Unit
	/**
	 * The list of possibility node, each representing a possible value for the rule.
	 */
	explanation: Array<Possibility & ASTNode<'reference' | 'constant'>>

	/** @deprecated : explicitely define a rule for the absence of choice (for instance : 'aucun' or 'non applicable' or 'autre' ) */
	'choix obligatoire'?: 'oui' | 'non'
}

/**
 * Parses a "une possibilité" mechanism in a rule, which defines a finite list of possible values.
 *
 * The values can be defined in three ways (latter two are deprecated):
 * 1. At the root level with 'une possibilité'
 * 2. Inside 'valeur' or 'formule'
 * 3. With a nested 'possibilités'
 *
 * Allowed value types:
 * - Strings
 * - Numbers
 * - References to existing rules
 * - Inline rule definitions
 *
 * @param rawRule - Raw rule object containing the possibilities
 * @param context - Parser context with logging and metadata
 * @param avec - Rule definitions object, modified to include inline rules
 * @returns Node representing the mechanism, or null if not defined
 * @throws {PublicodesError} If possibilities are empty or invalid
 *
 * @example
 * ```yaml
 * my rule:
 *   une possibilité:
 *     - value1
 *     - value2:
 *         applicable si: condition
 * ```
 */
export function parseUnePossibilité(
	rawRule: Rule,
	context: Context,
	avec: Record<string, Rule>,
): UnePossibilitéNode | null {
	let possibilités: RulePossibilités | false = false
	let choixObligatoire: 'oui' | 'non' | undefined
	if (rawRule.valeur && rawRule.valeur['une possibilité']) {
		possibilités = rawRule.valeur['une possibilité']
		warning(
			context.logger,
			`La clé 'une possibilité' à l'intérieur de la clé 'valeur' est dépréciée, veuillez la déplacer
au niveau supérieur.`,
			{ dottedName: context.dottedName },
		)
		delete rawRule.valeur['une possibilité']
	}
	if (rawRule.formule?.['une possibilité']) {
		possibilités = rawRule.formule['une possibilité']
		warning(
			context.logger,
			`La clé 'une possibilité' à l'intérieur de la clé 'formule' est dépréciée, veuillez la déplacer au niveau supérieur.`,
			{ dottedName: context.dottedName },
		)
		delete rawRule.formule['une possibilité']
	}

	if ('une possibilité' in rawRule) {
		if (!rawRule['une possibilité']) {
			throw new PublicodesError(
				'SyntaxError',
				`La clé 'une possibilité' ne peut pas être vide`,
				context,
			)
		}
		possibilités = rawRule['une possibilité']
	}

	if (!possibilités) {
		return null
	}

	if ('possibilités' in possibilités) {
		// TODO V2: Remove this block
		if (possibilités['choix obligatoire']) {
			warning(
				context.logger,
				`Les clés 'choix obligatoire' et 'possibilités' à l'intérieur de 'une possibilité' sont dépréciées. 

Déplacez les possibilités directement à la racine de 'une possibilité' .${
					possibilités['choix obligatoire'] === 'non' ?
						`Pour ajouter un choix « aucun », « non applicable » ou « autre » à la liste des possibilité, créer explicitement une règle dédiée. Par exemple : 

\`une possibilité: [${possibilités.possibilités.join(', ')}, aucun]\`
`
					:	''
				}`,

				{ dottedName: context.dottedName },
			)
			choixObligatoire = possibilités['choix obligatoire'] as 'oui' | 'non'
		} else {
			warning(
				context.logger,
				`La clé 'possibilités' à l'intérieur de 'une possibilité' est dépréciée. 

Déplacez les possibilités directement à la racine de 'une possibilité'
`,
				{ dottedName: context.dottedName },
			)
		}
		possibilités = possibilités['possibilités']
	}

	if (!possibilités) {
		return null
	}

	if (!possibilités.length) {
		throw new PublicodesError(
			'SyntaxError',
			`La clé 'une possibilité' doit être un tableau contenant au moins un élément`,
			context,
		)
	}

	const node = parsePossibilités(possibilités, avec, context)
	if (choixObligatoire) {
		node['choix obligatoire'] = choixObligatoire
	}

	// Check for duplicates
	let values: Array<string | number>

	if (node.type === 'number') {
		// Unit conversion before checking for duplicates
		values = node.explanation.map((currentNode) =>
			convertUnit(currentNode.unit, node.unit, currentNode.nodeValue as number),
		)
	} else {
		values = node.explanation.map((n) => n.publicodesValue)
	}

	if (new Set(values).size !== values.length) {
		const doublons = values
			.map((v, i, a) =>
				a.indexOf(v) !== i ? node.explanation[i].publicodesValue : null,
			)
			.filter(Boolean)
		throw new PublicodesError(
			'SyntaxError',
			`Il ne doit pas y avoir de doublons parmi les possibilités.
Les valeurs suivantes sont en double : ${doublons.join(', ')}.`,

			context,
		)
	}

	return node
}

function parsePossibilités(
	possibilities: Array<string | Record<string, Rule>>,
	avec: Record<string, Rule>,
	context: Context,
): UnePossibilitéNode {
	let referenceNode: Possibility

	const explanation = possibilities.map((possibility) => {
		const node = parsePossibilité(possibility, avec, context)

		referenceNode ??= node

		if (node.type !== referenceNode.type) {
			throw new PublicodesError(
				'SyntaxError',
				`Les possibilités doivent être toutes du même type.
${referenceNode.publicodesValue} et ${node.publicodesValue} ne sont pas du même type.`,
				context,
			)
		}
		if (
			referenceNode.type === 'number' &&
			node.type === 'number' &&
			referenceNode.unit
		) {
			try {
				convertUnit(node.unit, referenceNode.unit, 0)
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (e) {
				throw new PublicodesError(
					'SyntaxError',
					`Les possibilités doivent être toutes dans la même classe d'unité.

					${serializeUnit(node.unit)} n'est pas convertible en ${serializeUnit(
						referenceNode.unit,
					)}.`,
					context,
				)
			}
			referenceNode = node
		}

		return node
	})

	referenceNode ??= explanation[0]

	return {
		nodeKind: 'une possibilité',
		...('unit' in referenceNode ? { unit: referenceNode.unit } : {}),
		type: referenceNode.type,
		explanation,
	}
}

registerEvaluationFunction(
	'une possibilité',
	function evaluate(node: UnePossibilitéNode) {
		const evalNode = weakCopyObj(node) as EvaluatedNode & UnePossibilitéNode
		if (node.type !== 'reference') {
			evalNode.missingVariables = {}
			evalNode.nodeValue = undefined
			return evalNode
		}

		const explanation = node.explanation.map((n) => {
			const notApplicable = this.evaluateNode(n.notApplicable)
			return {
				...n,
				notApplicable,
				missingVariables: notApplicable.missingVariables,
			}
		})
		evalNode.explanation = explanation
		evalNode.missingVariables = mergeAllMissing(
			explanation.map((n) => n.notApplicable),
		)

		const applicableValues = explanation.filter(
			(n) => n.notApplicable.nodeValue !== true,
		)

		// If all values are not applicable, the whole possibility is not applicable
		if (applicableValues.length === 0) {
			evalNode.nodeValue = null
			return evalNode
		}

		// If only one value is applicable, return it
		if (applicableValues.length === 1) {
			evalNode.nodeValue = applicableValues[0].nodeValue
			return evalNode
		}

		evalNode.nodeValue = undefined
		return evalNode
	},
)
