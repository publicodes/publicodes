import { ASTNode, PublicodesError, serializeUnit } from '.'
import parse from './parse'
import { Context } from './parsePublicodes'
import parseReference from './reference'
import { Rule } from './rule'
import { convertUnit } from './units'

export type RulePossibilities =
	| Array<string | Record<string, Rule>>
	| {
			possibilités: Array<string | Record<string, Rule>>
	  }

export function parseUnePossibilité(
	possibilities: NonNullable<RulePossibilities>,
	context: Context,
): [
	possibleChoices: Array<ASTNode<'constant' | 'reference'>>,
	avec: Record<string, Rule>,
] {
	const avec: Record<string, Rule> = {}
	let unit
	if (!Array.isArray(possibilities)) {
		possibilities = possibilities.possibilités
	}
	const possibleChoices = possibilities.map((choice) => {
		const parsedChoice = parse(choice, context)

		if (
			parsedChoice.nodeKind !== 'constant' &&
			parsedChoice.nodeKind !== 'reference'
		) {
			throw new PublicodesError(
				'SyntaxError',
				`"${choice}" n'est pas une constante ou une référence.
Les choix possibles doivent être des constantes ou des références.`,
				context,
			)
		}

		if (parsedChoice.nodeKind === 'reference') {
			avec[parsedChoice.dottedName as string] = {}
			return parsedChoice
		}
		if (parsedChoice.nodeKind === 'constant' && parsedChoice.type === 'date') {
			throw new PublicodesError(
				'SyntaxError',
				'Il n’est pas possible de définir une date comme possibilité. Si vous avez besoin de cette fonctionnalité, merci de créer une issue sur Github.',
				context,
			)
		}
		if (
			parsedChoice.nodeKind === 'constant' &&
			parsedChoice.type === 'number' &&
			'unit' in parsedChoice
		) {
			if (!unit) {
				unit = parsedChoice.unit
			}
			try {
				convertUnit(parsedChoice.unit, unit, 1)
			} catch (e) {
				throw new PublicodesError(
					'TypeError',
					`Les possibilités doivent être homogènes en unité.
"${choice}" n'a pas une unité compatible avec les autres possibilités.

Unité attendue : ${serializeUnit(unit)}
`,
					context,
				)
			}
		}
		return parsedChoice
	})

	return [possibleChoices, avec]
}
