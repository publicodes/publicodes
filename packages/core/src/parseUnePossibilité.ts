import { ASTNode, PublicodesError, serializeUnit } from '.'
import { Unit } from '../dist'
import { warning } from './error'
import { Context } from './parsePublicodes'
import { Rule } from './rule'
import { convertUnit } from './units'
import { parsePossibilité } from './parsePossibilité'
import { registerEvaluationFunction } from './evaluationFunctions'
import { parseEstNonApplicable } from './mecanisms/est-non-applicable'
import { mergeAllMissing } from './evaluationUtils'

export type RulePossibilités =
	| Array<string | Record<string, Rule>>
	| { possibilités: Array<string | Record<string, Rule>> }

export type UnePossibilitéNode = {
	nodeKind: 'une possibilité'
} & (
	| {
			type: 'number'
			unit: Unit | undefined
			explanation: Array<
				ASTNode<'constant'> & { nodeValue: number; unit: Unit | undefined }
			>
	  }
	| {
			type: 'reference'
			values: Array<`'${string}'`>
			explanation: Array<ASTNode<'est non applicable'>>
	  }
	| {
			type: 'string'
			values: Array<`'${string}'`>
			explanation: Array<
				ASTNode<'constant'> & { nodeValue: string; type: 'string' }
			>
	  }
)

export function parseUnePossibilité(
	rawRule: Rule,
	context: Context,
): {
	node: UnePossibilitéNode
	avec: Record<string, Rule>
} | null {
	let possibilités: RulePossibilités | false = false

	if (rawRule.valeur && rawRule.valeur['une possibilité']) {
		possibilités = rawRule.valeur['une possibilité']
		warning(
			context.logger,
			`La clé 'une possibilité' à l'intérieur de la clé 'valeur' est dépréciée, veuillez la déplacer
au niveau supérieur.`,
			{ dottedName: context.dottedName },
		)
	}
	if (rawRule.formule?.['une possibilité']) {
		possibilités = rawRule.formule['une possibilité']
		warning(
			context.logger,
			`La clé 'une possibilité' à l'intérieur de la clé 'formule' est dépréciée, veuillez la déplacer au niveau supérieur.`,
			{ dottedName: context.dottedName },
		)
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

	const avec = Object.assign({}, rawRule.avec) as Record<string, Rule>
	const node = parsePossibilités(possibilités, avec, context)

	// Check for duplicates
	if (
		node.type !== 'number' &&
		new Set(node.values).size !== node.values.length
	) {
		throw new PublicodesError(
			'SyntaxError',
			`Il ne doit pas y avoir de doublons parmi les possibilités.`,
			context,
		)
	}

	// Check for duplicates after unit conversion
	if (node.type === 'number') {
		const values = node.explanation.map((n) =>
			convertUnit(n.unit, node.unit, n.nodeValue),
		)
		if (new Set(values).size !== values.length) {
			throw new PublicodesError(
				'SyntaxError',
				`Il ne doit pas y avoir de doublons parmi les possibilités.`,
				context,
			)
		}
	}

	return { node: node, avec }
}

function parsePossibilités(
	possibilities: Array<string | Record<string, Rule>>,
	avec: Record<string, Rule>,
	context: Context,
): UnePossibilitéNode {
	let referenceNode: ASTNode<'constant' | 'reference'>

	const explanation = possibilities.map((possibility) => {
		const node = parsePossibilité(possibility, avec, context)

		referenceNode ??= node

		if (node.nodeKind !== referenceNode.nodeKind) {
			throw new PublicodesError(
				'SyntaxError',
				`Les possibilités doivent être toutes des constantes ou toutes des références à des règles.
				`,
				context,
			)
		}

		if (node.nodeKind === 'constant' && referenceNode.nodeKind === 'constant') {
			if (node.type !== referenceNode.type) {
				throw new PublicodesError(
					'SyntaxError',
					`Les possibilités doivent être toutes du même type.`,
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
		return node
	})

	referenceNode ??= explanation[0]
	if (referenceNode.nodeKind === 'reference') {
		return {
			nodeKind: 'une possibilité',
			type: 'reference',
			explanation: explanation.map((node) =>
				parseEstNonApplicable(node, context),
			),
			values: explanation.map(
				(n) => `'${n.rawNode as string}'`,
			) as Array<`'${string}'`>,
		}
	}
	if (
		referenceNode.nodeKind === 'constant' &&
		referenceNode.type === 'number'
	) {
		return {
			nodeKind: 'une possibilité',
			type: 'number',
			unit: referenceNode.unit,
			explanation: explanation as Array<
				ASTNode<'constant'> & {
					nodeValue: number
					unit: Unit | undefined
				}
			>,
		}
	}
	return {
		nodeKind: 'une possibilité',
		type: 'string',
		explanation: explanation as Array<
			ASTNode<'constant'> & { nodeValue: string; type: 'string' }
		>,
		values: explanation.map((n) => n.rawNode as `'${string}'`),
	}
}

registerEvaluationFunction(
	'une possibilité',
	function evaluate(node: UnePossibilitéNode) {
		if (node.type !== 'reference') {
			return Object.assign(node, { missingVariables: {}, nodeValue: undefined })
		}

		const explanation = node.explanation.map((n) => this.evaluateNode(n))
		const applicableValues = explanation.filter((n) => n.nodeValue !== true)

		// If all values are not applicable, the whole possibility is not applicable
		if (applicableValues.length === 0) {
			return Object.assign(node, {
				nodeValue: null,
				values: [],
				missingVariables: mergeAllMissing(explanation),
			})
		}

		// If only one value is applicable, return it
		if (applicableValues.length === 1) {
			return Object.assign(node, {
				nodeValue: applicableValues[0].explanation.rawNode as string,
				values: [applicableValues[0].explanation.rawNode as string],
				missingVariables: mergeAllMissing(explanation),
			})
		}

		return Object.assign(node, {
			nodeValue: undefined,
			missingVariables: mergeAllMissing(explanation),
			values: applicableValues.map((n) => `'${n.explanation.rawNode}'`),
		})
	},
)
