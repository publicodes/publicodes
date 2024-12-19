import { ASTNode, PublicodesError, serializeUnit, Unit } from '.'
import { warning } from './error'
import { convertNodeToUnit } from './nodeUnits'
import parse from './parse'
import { Context } from './parsePublicodes'
import { Rule } from './rule'
import { convertUnit } from './units'

export type RulePossibilities =
	| Array<string | Record<string, Rule>>
	| {
			possibilités: Array<string | Record<string, Rule>>
	  }

type PossibilityNode = (ASTNode<'constant'> | ASTNode<'reference'>) & {
	publicodesValue: string | number
}
export function parseUnePossibilité(
	rawRule: Rule,
	context: Context,
): {
	parsedPossibilities: Array<PossibilityNode>
	avec: Record<string, Rule>
} | null {
	let possibilities: RulePossibilities | false = false

	if (rawRule.valeur && rawRule.valeur['une possibilité']) {
		possibilities = rawRule.valeur['une possibilité']
		warning(
			context.logger,
			`La clé 'une possibilité' à l'intérieur de la clé 'valeur' est dépréciée, veuillez la déplacer
au niveau supérieur.`,
			{ dottedName: context.dottedName },
		)
	}
	if (rawRule.formule?.['une possibilité']) {
		possibilities = rawRule.formule['une possibilité']
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
		possibilities = rawRule['une possibilité']
	}

	if (!possibilities) {
		return null
	}
	if ('possibilités' in possibilities) {
		possibilities = possibilities['possibilités']
		warning(
			context.logger,
			`La clé 'possibilités' à l'intérieur de la clé 'une possibilité' est dépréciée. Utilisez directement la clé 'une possibilité' pour lister les possibilités.`,
			{ dottedName: context.dottedName },
		)
	}

	if (!possibilities) {
		return null
	}

	if (!possibilities.length) {
		throw new PublicodesError(
			'SyntaxError',
			`La clé 'une possibilité' doit être un tableau contenant au moins un élément`,
			context,
		)
	}

	const avec = Object.assign({}, rawRule.avec) as Record<string, Rule>
	const parsedPossibilities = parsePossibilities(possibilities, avec, context)

	// Check for duplicates
	const values = parsedPossibilities.map((c) => c.publicodesValue)
	if (new Set(values).size !== values.length) {
		throw new PublicodesError(
			'SyntaxError',
			`Il ne doit pas y avoir de doublons parmi les possibilités.`,
			context,
		)
	}

	// Check for duplicates after unit conversion
	if (
		parsedPossibilities[0].nodeKind === 'constant' &&
		parsedPossibilities[0].type === 'number'
	) {
		const possibilities = parsedPossibilities as Array<
			ASTNode<'constant'> & { type: 'number' }
		>
		const unit = possibilities.find((possibility) => possibility.unit)?.unit
		if (unit) {
			const values = possibilities.map((n) =>
				convertUnit(n.unit, unit, n.nodeValue as number),
			)
			if (new Set(values).size !== values.length) {
				throw new PublicodesError(
					'SyntaxError',
					`Il ne doit pas y avoir de doublons parmi les possibilités.`,
					context,
				)
			}
		}
	}

	return { parsedPossibilities, avec }
}

function parsePossibilities(
	possibilities: Array<string | Record<string, Rule>>,
	avec: Record<string, Rule>,
	context: Context,
): Array<PossibilityNode> {
	let referencePossibility: ASTNode<'constant'> | ASTNode<'reference'>

	const possibleChoices = possibilities.map((possibility) => {
		const parsedPossibility = parsePossibility(
			possibility,
			avec,
			context,
		) as PossibilityNode
		referencePossibility ??= parsedPossibility

		if (parsedPossibility.nodeKind !== referencePossibility.nodeKind) {
			throw new PublicodesError(
				'SyntaxError',
				`Les possibilités doivent être toutes des constantes ou toutes des références à des règles.
				`,
				context,
			)
		}

		if (
			parsedPossibility.nodeKind === 'constant' &&
			referencePossibility.nodeKind === 'constant'
		) {
			if (parsedPossibility.type !== referencePossibility.type) {
				throw new PublicodesError(
					'SyntaxError',
					`Les possibilités doivent être toutes du même type.`,
					context,
				)
			}
			if (
				referencePossibility.type === 'number' &&
				parsedPossibility.type === 'number' &&
				referencePossibility.unit
			) {
				try {
					convertUnit(parsedPossibility.unit, referencePossibility.unit, 0)
				} catch (e) {
					throw new PublicodesError(
						'SyntaxError',
						`Les possibilités doivent être toutes dans la même unité.

					${serializeUnit(
						parsedPossibility.unit,
					)} n'est pas convertible en ${serializeUnit(
						referencePossibility.unit,
					)}.`,
						context,
					)
				}
				referencePossibility = parsedPossibility
			}
			parsedPossibility.publicodesValue = parsedPossibility.rawNode as
				| string
				| number
		}

		if (parsedPossibility.nodeKind === 'reference') {
			parsedPossibility.publicodesValue = `'${parsedPossibility.name}'`
		}
		return parsedPossibility
	}) as Array<ASTNode<'constant'>> | Array<ASTNode<'reference'>>
	return possibleChoices
}

function parsePossibility(
	possibility: string | Record<string, Rule>,
	avec: Record<string, Rule>,
	context: Context,
): ASTNode<'constant'> | ASTNode<'reference'> {
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

	const parsedChoice = parse(possibility, context)

	if (
		parsedChoice.nodeKind !== 'constant' &&
		parsedChoice.nodeKind !== 'reference'
	) {
		throw new PublicodesError(
			'SyntaxError',
			`"${possibility}" n'est pas une constante ou une référence.
Les choix possibles doivent être des constantes ou des références.`,
			context,
		)
	}

	if (parsedChoice.nodeKind === 'reference') {
		return parsedChoice
	}

	if (parsedChoice.nodeKind === 'constant' && parsedChoice.type === 'date') {
		throw new PublicodesError(
			'SyntaxError',
			'Il n’est pas possible de définir une date comme possibilité. Si vous avez besoin de cette fonctionnalité, merci de créer une issue sur Github.',
			context,
		)
	}
	return parsedChoice
}
