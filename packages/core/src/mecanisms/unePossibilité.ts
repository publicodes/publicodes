import { ASTNode, PublicodesError, serializeUnit } from '..'
import { EvaluatedNode, Unit } from '../AST/types'
import { warning } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { mergeAllMissing } from '../evaluationUtils'
import { parsePossibilité } from '../parsePossibilité'
import { Context } from '../parsePublicodes'
import { Rule } from '../rule'
import { convertUnit } from '../units'
import { weakCopyObj } from '../utils'
import { parseEstNonApplicable } from './est-non-applicable'

export type RulePossibilités =
	| Array<string | Record<string, Rule>>
	| { possibilités: Array<string | Record<string, Rule>> }

/**
 * Represents a node for a single possibility value in a "une possibilité" mechanism.
 * Can be either:
 * - A constant node containing a string/number literal value
 * - A reference node pointing to another rule
 */
export type PossibilityNode = ASTNode<'constant' | 'reference'> & {
	/**
	 * If the possibility is a reference, this contains a node that evaluates the applicability conditions of the referenced rule.
	 */
	notApplicable?: ASTNode<'est non applicable'>

	/**
	 * String representation of this possibility's value in publicodes syntax, if the possibility is a reference or a string.
	 * Always wrapped in single quotes, e.g. 'my value' or '123'
	 */
	publicodesValue?: `'${string}'`
}

export type UnePossibilitéNode = {
	nodeKind: 'une possibilité'
	type: 'number' | 'string' | 'reference'
	unit?: Unit
	/**
	 * The list of possibility node, each representing a possible value for the rule.
	 */
	explanation: Array<PossibilityNode>
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
		possibilités = possibilités['possibilités']
		warning(
			context.logger,
			`La clé 'possibilités' à l'intérieur de la clé 'une possibilité' est dépréciée. Utilisez directement la clé 'une possibilité' pour lister les possibilités.`,
			{ dottedName: context.dottedName },
		)
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

	// Check for duplicates
	let values: Array<string | number>

	if (node.type === 'number') {
		// Unit conversion before checking for duplicates
		values = (
			node.explanation as Array<
				ASTNode<'constant'> & {
					type: 'number'
					nodeValue: number
				}
			>
		).map((currentNode) =>
			convertUnit(currentNode.unit, node.unit, currentNode.nodeValue),
		)
	} else {
		values = node.explanation.map((n) => n.publicodesValue as string)
	}

	if (new Set(values).size !== values.length) {
		const doublons = values
			.map((v, i, a) =>
				a.indexOf(v) !== i ? node.explanation[i].rawNode : null,
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
	let referenceNode: ASTNode<'constant' | 'reference'>

	const explanation = possibilities.map((possibility) => {
		const node = parsePossibilité(possibility, avec, context) as PossibilityNode

		referenceNode ??= node

		if (node.nodeKind !== referenceNode.nodeKind) {
			throw new PublicodesError(
				'SyntaxError',
				`Les possibilités doivent être toutes des constantes ou toutes des références à des règles.`,
				context,
			)
		}

		if (node.nodeKind === 'constant' && referenceNode.nodeKind === 'constant') {
			if (node.type !== referenceNode.type) {
				throw new PublicodesError(
					'SyntaxError',
					`Les possibilités doivent être toutes du même type.
${referenceNode.rawNode} n'est pas convertible en ${node.type}.`,
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
						`Les possibilités doivent être toutes dans la même unité.

					${serializeUnit(node.unit)} n'est pas convertible en ${serializeUnit(
						referenceNode.unit,
					)}.`,
						context,
					)
				}
				referenceNode = node
			}
		}
		if (node.nodeKind === 'reference') {
			node.notApplicable = parseEstNonApplicable(weakCopyObj(node), context)
			node.publicodesValue = `'${node.rawNode}'`
		} else if (node.type === 'string') {
			node.publicodesValue = `'${node.nodeValue}'`
		}
		return node
	})

	referenceNode ??= explanation[0]

	return {
		nodeKind: 'une possibilité',
		...('unit' in referenceNode ? { unit: referenceNode.unit } : {}),
		type:
			referenceNode.nodeKind === 'reference' ? 'reference'
			: referenceNode.type === 'number' ? 'number'
			: 'string',
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
			const notApplicable = this.evaluateNode(n.notApplicable!)
			return {
				...n,
				notApplicable,
				missingVariables: notApplicable.missingVariables,
			}
		})
		evalNode.explanation = explanation
		evalNode.missingVariables = mergeAllMissing(explanation)

		const applicableValues = explanation.filter(
			(n) => n.notApplicable?.nodeValue !== true,
		)

		// If all values are not applicable, the whole possibility is not applicable
		if (applicableValues.length === 0) {
			evalNode.nodeValue = null
			return evalNode
		}

		// If only one value is applicable, return it
		if (applicableValues.length === 1) {
			evalNode.nodeValue = applicableValues[0].rawNode as string
			return evalNode
		}

		evalNode.nodeValue = undefined
		return evalNode
	},
)
