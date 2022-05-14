import { PublicodesExpression } from '..'
import { makeASTTransformer } from '../AST'
import { ASTNode } from '../AST/types'
import { syntaxError } from '../error'
import parse from '../parse'

const createEmptyContext = () => ({
	dottedName: 'internal',
	parsedRules: {},
	logger: console,
})

export function createParseInlinedMecanism(
	name: string,
	args: Record<string, { 'par défaut'?: PublicodesExpression; type?: 'liste' }>,
	body: PublicodesExpression
) {
	let parsedBody
	let parsedDefaultArgs
	function parseInlineMecanism(providedArgs, context) {
		parsedBody ??= parse(body, createEmptyContext())
		parsedDefaultArgs ??= Object.fromEntries(
			Object.entries(args)
				.filter(([, value]) => 'par défaut' in value)
				.map(([name, value]) => [
					name,
					parse(value['par défaut'], createEmptyContext()),
				])
		)

		// Case of unary mecanism
		if (Object.keys(args).length === 1 && 'valeur' in args) {
			providedArgs = {
				valeur: providedArgs,
			}
		}

		const parsedProvidedArgs = Object.fromEntries(
			Object.entries(providedArgs).map(([name, value]) => [
				name,
				parse(value, context),
			])
		)

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
			syntaxError(
				context,
				`Il manque la clé '${argName} dans le mécanisme ${name}`
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

export function createParseInlinedMecanismWithArray(
	name: string,
	args: Record<string, { type?: 'liste' }>,
	body: (args: Record<string, ASTNode | Array<ASTNode>>) => PublicodesExpression
) {
	function parseInlineMecanism(providedArgs, context) {
		// Case of unary mecanism
		if (Object.keys(args).length === 1 && 'valeur' in args) {
			providedArgs = {
				valeur: providedArgs,
			}
		}

		const parsedProvidedArgs = Object.fromEntries(
			Object.entries(providedArgs).map(([name, value]) => [
				name,
				Array.isArray(value)
					? value.map((v) => parse(v, context))
					: parse(value, context),
			])
		)
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
