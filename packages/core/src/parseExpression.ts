import nearley, { CompiledRules } from 'nearley'
import { PublicodesError } from './error'
import grammar from './grammar.codegen'

// TODO: nearley is currently exported as a CommonJS module which is why we need
// to destructure the default import instead of directly importing the symbols
// we need. This is sub-optimal because we our bundler will not tree-shake
// unused nearley symbols.
// https://github.com/kach/nearley/issues/535
const { Grammar, Parser } = nearley

const compiledGrammar = Grammar.fromCompiled(grammar as CompiledRules)

const parser = new Parser(compiledGrammar)
const initialState = parser.save()

type BinaryOp =
	| { '+': [ExprAST, ExprAST] }
	| { '-': [ExprAST, ExprAST] }
	| { '*': [ExprAST, ExprAST] }
	| { '/': [ExprAST, ExprAST] }
	| { '>': [ExprAST, ExprAST] }
	| { '<': [ExprAST, ExprAST] }
	| { '>=': [ExprAST, ExprAST] }
	| { '<=': [ExprAST, ExprAST] }
	| { '=': [ExprAST, ExprAST] }
	| { '!=': [ExprAST, ExprAST] }

type UnaryOp = { '-': [{ value: 0 }, ExprAST] }

/** AST of a publicodes expression. */
export type ExprAST =
	| BinaryOp
	| UnaryOp
	| { variable: string }
	| { constant: { type: 'number'; nodeValue: number }; unité?: string }
	| { constant: { type: 'boolean'; nodeValue: boolean } }
	| { constant: { type: 'string' | 'date'; nodeValue: string } }

/**
 * Parse a publicodes expression into an JSON object representing the AST.
 *
 * The parsing is done with the [nearley](https://nearley.js.org/) parser
 *
 * @param rawNode The expression to parse
 * @param dottedName The dottedName of the rule being parsed
 *
 * @returns The parsing result as a JSON object
 *
 * @throws A `SyntaxError` if the expression is invalid
 * @throws A `PublicodesInternalError` if the parser is unable to parse the expression
 *
 * @example
 * ```ts
 * parseExpression('20.3 * nombre', 'foo . bar')
 * // returns { "*": [ { constant: { type: "number", nodeValue: 20.3 } }, { variable:"nombre" } ] }
 * ```
 * @experimental
 */
export function parseExpression(rawNode: string, dottedName: string): ExprAST {
	/* Strings correspond to infix expressions.
	 * Indeed, a subset of expressions like simple arithmetic operations `3 + (quantity * 2)` or like `salary [month]` are more explicit that their prefixed counterparts.
	 * This function makes them prefixed operations. */
	const singleLineExpression = (rawNode + '').replace(/\s*\n\s*/g, ' ').trim()

	try {
		parser.restore(initialState)
		const [parseResult] = parser.feed(singleLineExpression).results

		if (parseResult == null) {
			throw new PublicodesError(
				'InternalError',
				`
Un problème est survenu lors du parsing de l'expression \`${singleLineExpression}\` :

	le parseur Nearley n'a pas réussi à parser l'expression.
`,
				{ dottedName },
			)
		}
		return parseResult
	} catch (e) {
		if (e instanceof PublicodesError || !(e instanceof Error)) {
			throw e
		}
		throw new PublicodesError(
			'SyntaxError',
			`\`${singleLineExpression}\` n'est pas une expression valide`,
			{ dottedName },
			e,
		)
	}
}
