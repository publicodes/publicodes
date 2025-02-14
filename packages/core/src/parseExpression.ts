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

export type BinaryOp =
	| { '+': [ExprAST, ExprAST] }
	| { '-': [ExprAST, ExprAST] }
	| { '*': [ExprAST, ExprAST] }
	| { '/': [ExprAST, ExprAST] }
	| { '**': [ExprAST, ExprAST] }
	| { '>': [ExprAST, ExprAST] }
	| { '<': [ExprAST, ExprAST] }
	| { '>=': [ExprAST, ExprAST] }
	| { '<=': [ExprAST, ExprAST] }
	| { '=': [ExprAST, ExprAST] }
	| { '!=': [ExprAST, ExprAST] }

export type UnaryOp = { '-': [{ value: 0 }, ExprAST] }

/** AST of a publicodes expression. */
export type ExprAST =
	| BinaryOp
	| UnaryOp
	| { variable: string }
	| { constant: { type: 'number'; nodeValue: number }; unité?: string }
	| { constant: { type: 'boolean'; nodeValue: boolean } }
	// NOTE: pourquoi ne pas utiliser le type Date directement ?
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

type Parser = {
	readonly strExpression: string
	current: number
	tree: ExprAST | null
}

export function parseExpressionNext(
	rawNode: string,
	_dottedName?: string,
): ExprAST {
	const singleLineExpression = (rawNode + '').replace(/\s*\n\s*/g, ' ').trim()

	const res = parseComparison({
		strExpression: singleLineExpression,
		current: 0,
		tree: null,
	})

	if (!isEOL(res)) {
		throw new Error('Expected end of line, but got ' + peek(res))
	}

	return res.tree!
}

// PERF:
// - muter le parser sur place
// - stocker uniquement la string slicée pour accélérer les lookAhead
function parseComparison(parser: Parser): Parser {
	let left = parseAddition(parser)

	while (
		!isEOL(left) &&
		(isNext(left, ' > ') ||
			isNext(left, ' < ') ||
			isNext(left, ' >= ') ||
			isNext(left, ' <= ') ||
			isNext(left, ' = ') ||
			isNext(left, ' != '))
	) {
		expect(left, ' ')
		const operator = consume(left)
		const operator2 = consume(left)
		if (operator2 !== ' ') {
			expect(left, ' ')
		}
		const right = parseAddition(left)

		right.tree = binaryNode(
			operator2 === ' ' ? operator : operator + operator2,
			left.tree!,
			right.tree!,
		)
		left = right
	}

	return left
}

function parseAddition(parser: Parser): Parser {
	let left = parseTerm(parser)

	while (!isEOL(left) && (isNext(left, ' + ') || isNext(left, ' - '))) {
		expect(left, ' ')
		const operator = consume(left)
		expect(left, ' ')
		const right = parseTerm(left)

		// NOTE: peut-on faire plus simple ?
		right.tree = binaryNode(operator, left.tree!, right.tree!)
		left = right
	}

	return left
}

function parseTerm(parser: Parser): Parser {
	let left = parseFactor(parser)

	while (
		!isEOL(left) &&
		(isNext(left, ' * ') || isNext(left, ' / ') || isNext(left, ' // '))
	) {
		expect(left, ' ')
		// NOTE: peut-on faire plus simple ?
		const op = consume(left)
		const op2 = consume(left)
		if (op2 !== ' ') {
			expect(left, ' ')
		}
		const right = parseFactor(left)

		// NOTE: peut-on faire plus simple ?
		right.tree = binaryNode(
			op2 === ' ' ? op : op + op2,
			left.tree!,
			right.tree!,
		)
		left = right
	}
	return left
}

function parseFactor(parser: Parser): Parser {
	let left = parsePrimary(parser)

	while (!isEOL(left) && isNext(left, ' ** ')) {
		expect(left, ' ')
		expect(left, '*')
		expect(left, '*')
		expect(left, ' ')
		const right = parsePrimary(left)

		right.tree = binaryNode('**', left.tree!, right.tree!)
		left = right
	}
	return left
}

// TODO: factoriser en sous-fonctions ?
function parsePrimary(parser: Parser): Parser {
	if (peek(parser) === '(') {
		consume(parser)
		const expr = parseComparison(parser)
		expect(expr, ')')
		return expr
	} else if (peek(parser) === '-') {
		consume(parser)
		const expr = parsePrimary(parser)
		return { ...expr, tree: minusNode(expr.tree!) }
	} else if (isNextRegExp(parser, date)) {
		const res = expectRegExp(parser, date)
		return {
			...res.parser,
			tree: dateNode(res.value),
		}
	} else if (peek(parser).match(number)) {
		// TODO: gérer les unités
		const res = expectRegExp(parser, number)
		if (isNextRegExp(res.parser, unit_identifier)) {
		}
		return {
			...res.parser,
			tree: numberNode(parseFloat(res.value)),
		}
	} else if (isNext(parser, "'") || isNext(parser, '"')) {
		const res = expectRegExp(parser, string)
		return {
			...res.parser,
			tree: { constant: { type: 'string', nodeValue: res.value.slice(1, -1) } },
		}
	} else if (peek(parser).match(letter)) {
		const res = expectRegExp(parser, dotted_name)

		return {
			...res.parser,
			tree:
				res.value === 'oui' || res.value === 'non' ?
					booleanNode(res.value)
				:	{ variable: res.value },
		}
	}
	// TODO: meilleure message d'erreur
	throw new Error(`Unexpected token ${peek(parser)}`)
}

function peek(parser: Parser, n?: number): string {
	return n ?
			parser.strExpression.slice(parser.current, parser.current + n)
		:	parser.strExpression[parser.current]
}

// PERF: il faudrait tester d'autre technique que le slice, mais pour l'instant
// je fais au plus simple.
function isNext(parser: Parser, toMatch: string): boolean {
	const slice = parser.strExpression.slice(
		parser.current,
		parser.current + toMatch.length,
	)
	return slice === toMatch
}

function isNextRegExp(parser: Parser, regexp: RegExp): boolean {
	return parser.strExpression.slice(parser.current).match(regexp) != null
}

function consume(parser: Parser): string {
	return parser.strExpression[parser.current++]
}

function expect(parser: Parser, expected: string): void {
	if (peek(parser) !== expected) {
		throw new Error(`Expected '${expected}' but got '${peek(parser)}'`)
	}
	consume(parser)
}

// NOTE: effet de bord sur le parser donné en argument (qui est muté) à voir si
// on souhaite garder cette approche et auquel cas pas besoin de retourner le
// parser ou bien si on souhaite garder une approche plus fonctionnelle et
// retourner le parser à chaque fois mais en le clonant pour ne pas muter.
function expectRegExp(
	parser: Parser,
	regexp: RegExp,
): { parser: Parser; value: string } {
	// NOTE: est-ce que l'on garderai pas uniquement le slice plutôt que le
	// current index ?
	const match = parser.strExpression.slice(parser.current).match(regexp)
	if (match == null) {
		throw new Error(`Expected ${regexp} but got ${peek(parser)}`)
	}
	parser.current += match[0].length
	return { parser, value: match[0] }
}

function isEOL(parser: Parser): boolean {
	return parser.current >= parser.strExpression.length
}

function lookAhead(parser: Parser, n: number): string | null {
	if (parser.current + n >= parser.strExpression.length) {
		return null
	}
	return parser.strExpression[parser.current + n]
}

function minusNode(expr: ExprAST): UnaryOp {
	return { '-': [{ value: 0 }, expr] }
}

function numberNode(value: number): ExprAST {
	return { constant: { type: 'number', nodeValue: value } }
}

function booleanNode(value: 'oui' | 'non'): ExprAST {
	return { constant: { type: 'boolean', nodeValue: value === 'oui' } }
}

function binaryNode(op: string, left: ExprAST, right: ExprAST): BinaryOp {
	// @ts-ignore
	return { [op]: [left, right] as [ExprAST, ExprAST] }
}

function dateNode(value: string): ExprAST {
	return { constant: { type: 'date', nodeValue: value } }
}

const boolean = /oui|non/
const space =
	/[\t\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/
const letter = /[a-zA-Z\u00C0-\u017F]/
const symbol = /[',°€%²$_'"'«»]/
// const symbol = prec(0, /[',°€%²$_'"'«»]/) // TODO: add parentheses
const digit = /\d/
const string = /'.*?'|".*?"/

const number = /\d+(\.\d+)?/
const date = /^(?:(?:0?[1-9]|[12][0-9]|3[01])\/)?(?:0?[1-9]|1[012])\/\d{4}/
const exposant = /[⁰-⁹]+/

// const any_char = choice(letter, symbol, digit)
const any_char = new RegExp(
	`(${letter.source}|${symbol.source}|${digit.source})`,
)
// const any_char_or_special_char = choice(any_char, /\-|\+/)
// NOTE: pourquoi '+' et '-' ici ?
const any_char_or_special_char = new RegExp(`(${any_char.source}|\\-|\\+)`)
// const any_char_or_special_char = new RegExp(`${any_char.source}`)

// const phrase_starting_with = (char) =>
// 	seq(
// 		seq(char, repeat(any_char_or_special_char)),
// 		repeat(seq(space, seq(any_char, repeat(any_char_or_special_char)))),
// 	)

const phrase_starting_with = (char) =>
	new RegExp(
		`(${char.source}${any_char_or_special_char.source}*)(${space.source}${any_char.source}${any_char_or_special_char.source}*)*`,
	)

const rule_name = phrase_starting_with(letter)

// FIXME: dont work
const dotted_name = new RegExp(`${rule_name.source}( \\. ${rule_name.source})*`)

const unit_symbol = /[°%\p{Sc}]/ // °, %, and all currency symbols (to be completed?)
const unit_identifier = phrase_starting_with(
	new RegExp(`${unit_symbol.source}|${letter.source}`),
)

console.log(
	JSON.stringify(
		parseExpressionNext('équipement * oui ma variable > 02/2024'),
		null,
		2,
	),
)
