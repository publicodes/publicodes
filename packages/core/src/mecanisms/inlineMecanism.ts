import { PublicodesExpression } from '..'
import { makeASTTransformer } from '../AST'
import { ASTNode } from '../AST/types'
import { PublicodesError } from '../error'
import parse from '../parse'
import { Context, createContext } from '../parsePublicodes'

export function createParseInlinedMecanism(
	name: string,
	args: Record<string, { 'par défaut'?: PublicodesExpression; type?: 'liste' }>,
	body: PublicodesExpression,
) {
	let parsedBody
	let parsedDefaultArgs
	function parseInlineMecanism(providedArgs, context) {
		parsedBody ??= parse(body, createContext({ dottedName: 'INLINE_MECANISM' }))
		parsedDefaultArgs ??= {}
		for (const name in args) {
			if ('par défaut' in args[name]) {
				parsedDefaultArgs[name] = parse(
					args[name]['par défaut'],
					createContext({}),
				)
			}
		}

		// Case of unary mecanism
		if (Object.keys(args).length === 1 && 'valeur' in args) {
			providedArgs = {
				valeur: providedArgs,
			}
		}

		const parsedProvidedArgs = {}
		for (const name in providedArgs) {
			parsedProvidedArgs[name] = parse(providedArgs[name], context)
		}

		const parsedInlineMecanism = makeASTTransformer((node) => {
			if (node.nodeKind !== 'reference' || !(node.name in args)) {
				return
			}
			const argName = node.name
			if (argName in parsedProvidedArgs) {
				return parsedProvidedArgs[argName]
			}
			if (argName in parsedDefaultArgs) {
				return parsedDefaultArgs[argName]
			}
			throw new PublicodesError(
				'SyntaxError',
				`Il manque la clé '${argName} dans le mécanisme ${name}`,
				{ dottedName: argName },
			)
		})(parsedBody)

		parsedInlineMecanism.sourceMap = {
			mecanismName: name,
			args: parsedProvidedArgs,
		}

		return parsedInlineMecanism
	}

	parseInlineMecanism.nom = name

	return Object.assign(parseInlineMecanism, 'name', {
		value: `parse${toCamelCase(name)}Inline`,
	})
}

/**
 Note : Les transformations de mécanisme opérant sur les listes sont plus couteuses que celles opérant sur des scalaires.

 Cela vient du fait qu'il n'y a pas la possibilité de définir ces transformations dans publicodes : il manque le type liste et les opérations de bases associées (reduce, map).

 On doit donc déplier l'opération statiquement, au parsing, ce qui prend plus de temps, au parsing et à l'évaluation. somme: [1,2,3] est transformé en (1 + 2) + 3).

 De manière général, les baisse en performances de cette PR sont attenduee : il s'agit d'une contrepartie logique de l'utilisation de mécanisme de base publicodes. Ce qu'on gagne en solidité de l'évaluation & en amélioration du typage, on le perd en performance. C'est logique puisque l'evaluation de ces mécanisme n'est plus du JS natif mais passe par une structure intermédiaire.

 Pour améliorer les perfs, il y a plusieurs pistes :

	- optimiser d'avantage les opérations de bases
	- ajouter les listes et les opérations sur les listes dans publicodes
	- ajouter une implémentation "native" de certains mécanismes utilisés (on gagne quand même à les décomposer en mécanismes de base pour la partie spécification et typage).
 */
export function createParseInlinedMecanismWithArray(
	name: string,
	args: Record<string, { type?: 'liste' }>,
	body: (
		args: Record<string, ASTNode | Array<ASTNode>>,
	) => PublicodesExpression,
) {
	function parseInlineMecanism(providedArgs, context: Context) {
		// Case of unary mecanism
		if (Object.keys(args).length === 1 && 'valeur' in args) {
			providedArgs = {
				valeur: providedArgs,
			}
		}

		const parsedProvidedArgs = {}
		for (const name in providedArgs) {
			const value = providedArgs[name]
			parsedProvidedArgs[name] =
				Array.isArray(value) ?
					value.map((v) => parse(v, context))
				:	parse(value, context)
		}

		const parsedInlineMecanism = parse(body(parsedProvidedArgs), context)
		parsedInlineMecanism.sourceMap = {
			mecanismName: name,
			args: parsedProvidedArgs,
		}
		return parsedInlineMecanism
	}

	parseInlineMecanism.nom = name

	return Object.assign(parseInlineMecanism, 'name', {
		value: `parse${toCamelCase(name)}Inline`,
	})
}

function toCamelCase(str: string) {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (ltr) => ltr.toUpperCase())
		.replace(/\s+/g, '')
}
