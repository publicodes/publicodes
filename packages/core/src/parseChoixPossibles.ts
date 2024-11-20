import { PublicodesError } from '.'
import { ASTNode } from '../dist'
import parse from './parse'
import { Context } from './parsePublicodes'
import parseReference from './reference'
import { Rule } from './rule'

export function parseChoixPossibles(
	choices: NonNullable<Rule['choix possibles']>,
	context: Context,
): [
	parsedChoices: Array<ASTNode<'constant' | 'reference'>>,
	avec: Record<string, Rule>,
] {
	const avec: Record<string, Rule> = {}
	const parsedChoices = choices.map((choice) => {
		if (typeof choice === 'object') {
			const rules = Object.entries(choice)
			if (rules.length !== 1) {
				throw new PublicodesError(
					'SyntaxError',
					`Il ne peut y avoir qu'une seule définition de règle dans un choix possible.

Déplacer une des règles suivantes dans un autre élément du tableau : ${rules.map(
						([key]) => `\n\t- ${key} `,
					)}`,

					context,
				)
			}
			const dottedName = rules[0][0]
			const rule = rules[0][1] as Rule
			rule.valeur = `^ = ${dottedName}`
			avec[dottedName] = rule
			return parseReference(rules[0][0], context)
		}

		const parsedChoice = parse(choice, context)

		// TODO : authorize to have computed choice? For instance if we want some constant choice to be non applicable...
		if (
			parsedChoice.nodeKind !== 'constant' &&
			parsedChoice.nodeKind !== 'reference'
		) {
			throw new PublicodesError(
				'SyntaxError',
				`"${choice}" n'est pas une constante.
Les choix possibles doivent être des constantes (nombre, texte, date, etc.) ou des références à une règle existante.`,
				context,
			)
		}
		return parsedChoice
	})

	return [parsedChoices, avec]
}
