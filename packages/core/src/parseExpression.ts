import { PublicodesError } from './error'

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

export type UnaryOp = {
	'-': [{ constant: { type: 'number'; nodeValue: 0 } }, ExprAST]
}

/** AST of a publicodes expression. */
export type ExprAST =
	| BinaryOp
	| UnaryOp
	| { variable: string }
	| { constant: { type: 'number'; nodeValue: number; rawUnit?: string } }
	| { constant: { type: 'boolean'; nodeValue: boolean } }
	// NOTE: pourquoi ne pas utiliser le type Date directement ?
	| { constant: { type: 'string' | 'date'; nodeValue: string } }

type ParserErrorDetails = {
	expression: string
	position: number
	expected: string
	found: string
	customMessage?: string
}

class ParserError extends Error {
	details: ParserErrorDetails

	constructor(details: ParserErrorDetails) {
		const message = formatParserError(details)
		super(message)
		this.details = details
	}
}

class SyntaxError extends PublicodesError<'SyntaxError'> {
	constructor(details: ParserErrorDetails & { dottedName: string }) {
		const message = formatParserError(details)
		super('SyntaxError', message, details)
	}
}

function formatParserError({
	expression,
	position,
	expected,
	found,
	customMessage,
}: ParserErrorDetails): string {
	const pointer = ' '.repeat(position) + '^'
	const defaultMessage = `${expected} est attendu, ${found ? `mais "${found}" a été trouvé` : 'hors l’expression se termine prématurément'}`

	return `L'expression suivante n'est pas valide :
   
   ${expression}
   ${pointer}
   ${customMessage ?? defaultMessage}
`
}

type ParserState = {
	readonly strExpression: string
	current: number
	tree: ExprAST | null
}

function createParser(expression: string): ParserState {
	return {
		strExpression: expression,
		current: 0,
		tree: null,
	}
}

function throwParserError(
	parser: ParserState,
	expected: string,
	found: string,
	customMessage?: string,
): never {
	throw new ParserError({
		expression: parser.strExpression,
		position: parser.current,
		expected,
		found,
		customMessage,
	})
}

function consume(parser: ParserState, expected: string): string {
	if (isEOL(parser)) {
		throwParserError(parser, `'${expected}'`, '')
	}
	return parser.strExpression[parser.current++]
}

function expect(parser: ParserState, expected: string): void {
	const char = peek(parser)
	if (char !== expected) {
		throwParserError(parser, `'${expected}'`, char)
	}
	consume(parser, expected)
}

function expectRegExp(
	parser: ParserState,
	regexp: RegExp,
	description?: string,
	errorMessage?: string,
): { parser: ParserState; value: string } {
	const match = parser.strExpression.slice(parser.current).match(regexp)
	if (!match) {
		throwParserError(
			parser,
			description ?? regexp.source,
			peek(parser, 5),
			errorMessage,
		)
	}
	parser.current += match[0].length
	return { parser, value: match[0] }
}

export function parseExpression(
	rawNode: string,
	dottedName = '<expression>',
): ExprAST {
	if (typeof rawNode === 'number') {
		return numberNode(rawNode)
	}

	const singleLineExpression = (rawNode + '').replace(/\s*\n\s*/g, ' ').trim()

	try {
		const parser = createParser(singleLineExpression)
		const res = parseComparison(parser)

		if (!isEOL(res)) {
			if (isNextRegExp(res, operators)) {
				throwParserError(
					res,
					'un opérateur entouré d’espaces',
					peek(res),
					'Les opérateurs doivent être entourés d’espaces ("2 + 2" et non "2+2")',
				)
			}

			throwParserError(res, 'La fin d’expression', peek(res))
		}

		return res.tree!
	} catch (error) {
		if (error instanceof ParserError) {
			throw new SyntaxError({
				...error.details,
				dottedName,
			})
		}
		throw error
	}
}

function parseComparison(parser: ParserState): ParserState {
	let left = parseAddition(parser)

	while (!isEOL(left) && isNextRegExp(left, comparisonOperator)) {
		const op = expectRegExpGroup(left, comparisonOperator)
		const right = parseAddition(op.parser)

		right.tree = binaryNode(op.value, left.tree!, right.tree!)
		left = right
	}

	return left
}

function parseAddition(parser: ParserState): ParserState {
	let left = parseMultiplication(parser)

	while (!isEOL(left) && isNextRegExp(left, additionOperator)) {
		const op = expectRegExpGroup(left, additionOperator)
		const right = parseMultiplication(op.parser)

		right.tree = binaryNode(op.value, left.tree!, right.tree!)
		left = right
	}

	return left
}

function parseMultiplication(parser: ParserState): ParserState {
	let left = parseExponentiation(parser)

	while (!isEOL(left) && isNextRegExp(left, multiplyOperator)) {
		const op = expectRegExpGroup(left, multiplyOperator)
		const right = parseExponentiation(op.parser)

		right.tree = binaryNode(op.value, left.tree!, right.tree!)
		left = right
	}

	return left
}

function parseExponentiation(parser: ParserState): ParserState {
	let left = parsePrimary(parser)

	while (!isEOL(left) && isNextRegExp(left, exponentiationOperator)) {
		const op = expectRegExpGroup(left, exponentiationOperator)
		const right = parseExponentiation(op.parser)

		right.tree = binaryNode(op.value, left.tree!, right.tree!)
		left = right
	}

	return left
}

// TODO: factoriser en sous-fonctions ?
function parsePrimary(parser: ParserState): ParserState {
	if (peek(parser) === '(') {
		consume(parser, '(')
		expectRegExp(parser, spaces)
		const expr = parseComparison(parser)
		expectRegExp(expr, spaces)
		expect(expr, ')')
		return expr
	} else if (peek(parser) === '-') {
		consume(parser, '-')
		expectRegExp(parser, spaces)
		const expr = parsePrimary(parser)
		expr.tree = minusNode(expr.tree!)
		return expr
	} else if (isNextRegExp(parser, date)) {
		const res = expectRegExp(parser, date, 'Une date')
		return {
			...res.parser,
			tree: dateNode(res.value),
		}
	} else if (peek(parser).match(number)) {
		const res = expectRegExp(parser, number, 'Un nombre')
		if (isNextRegExp(res.parser, unit)) {
			const parsedUnit = expectRegExp(res.parser, unit, 'Une unité')
			return {
				...parsedUnit.parser,
				tree: {
					constant: {
						type: 'number',
						nodeValue: parseFloat(res.value),
						rawUnit: parsedUnit.value.trim(),
					},
				},
			}
		}
		return {
			...res.parser,
			tree: numberNode(parseFloat(res.value)),
		}
	} else if (isNext(parser, "'") || isNext(parser, '"')) {
		const res = expectRegExp(parser, string, 'Une chaîne de caractères')
		return {
			...res.parser,
			tree: { constant: { type: 'string', nodeValue: res.value.slice(1, -1) } },
		}
	} else if (peek(parser).match(letter) || peek(parser) === '^') {
		const res = expectRegExp(parser, dotted_name, 'Un nom de règle')

		return {
			...res.parser,
			tree:
				res.value === 'oui' || res.value === 'non' ?
					booleanNode(res.value)
				:	{ variable: res.value },
		}
	}
	throwParserError(
		parser,
		'Une constante, une référence ou une expression entre parenthèses',
		peek(parser),
	)
}

function peek(parser: ParserState, n?: number): string {
	return n ?
			parser.strExpression.slice(parser.current, parser.current + n)
		:	parser.strExpression[parser.current]
}

// PERF: il faudrait tester d'autre technique que le slice, mais pour l'instant
// je fais au plus simple.
function isNext(parser: ParserState, toMatch: string): boolean {
	const slice = parser.strExpression.slice(
		parser.current,
		parser.current + toMatch.length,
	)
	return slice === toMatch
}

function isNextRegExp(parser: ParserState, regexp: RegExp): boolean {
	return parser.strExpression.slice(parser.current).match(regexp) != null
}

function expectRegExpGroup(
	parser: ParserState,
	regexp: RegExp,
): { parser: ParserState; value: string } {
	const match = parser.strExpression.slice(parser.current).match(regexp)
	if (!match) {
		throw new Error(`Expected '${regexp.source}' but got ${peek(parser)}`)
	}
	parser.current += match[0].length
	return { parser, value: match[1] }
}

function isEOL(parser: ParserState): boolean {
	return parser.current >= parser.strExpression.length
}

function minusNode(expr: ExprAST): UnaryOp {
	return { '-': [{ constant: { type: 'number', nodeValue: 0 } }, expr] }
}

function numberNode(value: number): ExprAST {
	return { constant: { type: 'number', nodeValue: value } }
}

function booleanNode(value: 'oui' | 'non'): ExprAST {
	return { constant: { type: 'boolean', nodeValue: value === 'oui' } }
}

function binaryNode(op: string, left: ExprAST, right: ExprAST): BinaryOp {
	return { [op]: [left, right] } as BinaryOp
}

function dateNode(value: string): ExprAST {
	return { constant: { type: 'date', nodeValue: value } }
}

const space =
	/[\t\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/

const spaces = new RegExp(`^${space.source}*`)
const letter = /[a-zA-Z\u00C0-\u017F$]/
const symbol = /[',°€$%²_'"'«»]/

const digit = /\d/
const string = /'.*'|".*"/

const number = /\d+(\.\d+)?/
const date = /^(?:(?:0?[1-9]|[12][0-9]|3[01])\/)?(?:0?[1-9]|1[012])\/\d{4}/

const any_char = new RegExp(
	`(${letter.source}|${symbol.source}|${digit.source})`,
)

const any_char_or_special_char = new RegExp(`(${any_char.source}|\\-|\\+|')`)

const phrase_starting_with = (char: RegExp) =>
	new RegExp(
		`(${char.source}${any_char_or_special_char.source}*)(${space.source}${any_char.source}${any_char_or_special_char.source}*)*`,
	)

const rule_name = phrase_starting_with(letter)

const dotted_name = new RegExp(
	`^(${rule_name.source}|\\^)( \\. ${rule_name.source})*`,
)
const unit_symbol = /[°%\p{Sc}€$]/u // °, %, and all currency symbols (to do)
const unit_identifier = phrase_starting_with(
	new RegExp(`(${unit_symbol.source}|${letter.source})`),
)

const unit = new RegExp(
	`${spaces.source}(\\/)?${unit_identifier.source}(${space.source}*(\\.|\\/)${unit_identifier.source})*`,
)

const oneOfBetweenAtLeastOneSpace = (values: string[]) =>
	new RegExp(`^${space.source}+(${values.join('|')})${space.source}+`)

const exponentiationOperator = oneOfBetweenAtLeastOneSpace(['\\*\\*'])
const multiplyOperator = oneOfBetweenAtLeastOneSpace(['\\*', '\\/', '\\/\\/'])
const additionOperator = oneOfBetweenAtLeastOneSpace(['-', '\\+'])
const comparisonOperator = oneOfBetweenAtLeastOneSpace([
	'>',
	'<',
	'>=',
	'<=',
	'=',
	'!=',
])

const operators = /(\+|-|\*|\/|\*\*|>|<|>=|<=|=|!=)/
