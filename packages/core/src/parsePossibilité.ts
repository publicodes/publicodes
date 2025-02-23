import { ASTNode, PublicodesError, Unit } from '.'
import { parseEstNonApplicable } from './mecanisms/est-non-applicable'
import parse from './parse'
import { Context } from './parsePublicodes'
import { Rule } from './parseRule'
import { weakCopyObj } from './utils'

/**
 * Represents a single possibility value in a "une possibilité" mechanism. It can be a constant value (string or number), or a reference to an existing rule.
 */
export type Possibility = {
	type: 'number' | 'string' | 'reference'
	/**
	 * If the possibility is a reference, this contains a node that evaluates the applicability conditions of the referenced rule.
	 * Otherwise, it contains a constant node evaluating to false (as constant possibility are always applicable, for now)
	 */
	notApplicable: ASTNode

	/**
	 * Representation of this possibility's value in publicodes syntax, can be used in {@link Engine.setSituation} to set the value of the rule.
	 *
	 * String are wrapped in single quotes, and numbers are represented as number followed by an optional unit
	 * @example
	 * ```ts
	 * "'value'"
	 * "42 m/s"
	 * ```
	 */
	publicodesValue: string

	/**
	 * The value of the possibility, as it appears in the evaluated node.
	 */
	nodeValue: string | number
	/**
	 * The unit of the possibility value, if it is a number
	 * @see {@link serializeUnit}
	 */
	unit?: Unit
	/**
	 * The dotted name of the referenced rule, if the possibility is a reference.
	 */
	dottedName?: string
}

export function parsePossibilité(
	possibility: string | Record<string, Rule>,
	avec: Record<string, Rule>,
	context: Context,
): Possibility & ASTNode<'constant' | 'reference'> {
	if (typeof possibility === 'object') {
		if (Object.keys(possibility).length !== 1) {
			throw new PublicodesError(
				'SyntaxError',
				`Il ne peut y avoir qu'une seule définition de règle par possibilité.`,
				{ dottedName: context.dottedName },
			)
		}
		const [key, value] = Object.entries(possibility)[0]
		if (key in avec) {
			throw new PublicodesError(
				'SyntaxError',
				`La règle "${key}" est déjà définie`,
				{ dottedName: context.dottedName },
			)
		}
		avec[key] = value
		possibility = key
	}

	const node = parse(possibility, context)

	if (node.nodeKind !== 'constant' && node.nodeKind !== 'reference') {
		throw new PublicodesError(
			'SyntaxError',
			`"${possibility}" n'est pas une constante ou une référence.
Les choix possibles doivent être des constantes ou des références.`,
			context,
		)
	}

	if (node.nodeKind === 'reference') {
		return {
			...node,
			type: 'reference',
			notApplicable: parseEstNonApplicable(weakCopyObj(node), context),
			nodeValue: node.name,
			publicodesValue: `'${node.name}'`,
		} as Possibility & ASTNode<'reference'>
	}

	if (node.type !== 'string' && node.type !== 'number') {
		throw new PublicodesError(
			'SyntaxError',
			`Les choix possibles doivent être des nombres ou des chaînes de caractères.`,
			context,
		)
	}

	return {
		...node,
		type: node.type,
		notApplicable: falseNode,
		publicodesValue:
			node.type === 'string' ?
				`'${node.nodeValue}'`
			:	(node.rawNode as `${number}`),
		nodeValue: node.nodeValue as string | number,
		...('unit' in node && { unit: node.unit }),
	} as Possibility & ASTNode<'constant'>
}

const falseNode = {
	nodeKind: 'constant',
	type: 'boolean',
	nodeValue: false,
} as ASTNode<'constant'>
