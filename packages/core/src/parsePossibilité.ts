import { ASTNode, PublicodesError } from '.'
import parse from './parse'
import { Context } from './parsePublicodes'
import { Rule } from './rule'

export function parsePossibilité(
	possibility: string | Record<string, Rule>,
	avec: Record<string, Rule>,
	context: Context,
): ASTNode<'constant' | 'reference'> {
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
