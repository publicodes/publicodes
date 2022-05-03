import { PublicodesExpression } from '..'
import { makeASTTransformer } from '../AST'
import { syntaxError } from '../error'
import parse from '../parse'

const createEmptyContext = () => ({
	dottedName: 'internal',
	parsedRules: {},
	logger: console,
})

export function createParseInlinedMecanism(
	name: string,
	args: Record<string, { 'par défaut'?: PublicodesExpression }>,
	body: PublicodesExpression
) {
	let parsedBody
	let parsedDefaultArgs
	function parseInlineMecanisme(providedArgs, context) {
		parsedBody ??= parse(body, createEmptyContext())
		parsedDefaultArgs ??= Object.fromEntries(
			Object.entries(args)
				.filter(([, value]) => 'par défaut' in value)
				.map(([name, value]) => [
					name,
					parse(value['par défaut'], createEmptyContext()),
				])
		)

		const parsedProvidedArgs = Object.fromEntries(
			Object.entries(providedArgs).map(([name, value]) => [
				name,
				parse(value, context),
			])
		)

		return makeASTTransformer((node) => {
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
			syntaxError(
				context,
				`Il manque la clé '${argName} dans le mécanisme ${name}`
			)
		})(parsedBody)
	}
	parseInlineMecanisme.nom = name
	return Object.assign(parseInlineMecanisme, 'name', {
		value: `parse${name}Inline`,
	})
}
