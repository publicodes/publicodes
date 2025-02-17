import { createToken, CstParser } from 'chevrotain'

const space =
	/[\t\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/
const letter = /[a-zA-Z\u00C0-\u017F]/
const symbol = /[',°€%²$_'"'«»]/
// const symbol = prec(0, /[',°€%²$_'"'«»]/) // TODO: add parentheses
const digit = /\d/

const number = /\d+(\.\d+)?/
const date = /(?:(?:0?[1-9]|[12][0-9]|3[01])\/)?(?:0?[1-9]|1[012])\/\d{4}/
const exposant = /[⁰-⁹]+/

// const any_char = choice(letter, symbol, digit)
const any_char = new RegExp(
	`(${letter.source}|${symbol.source}|${digit.source})`,
)
// const any_char_or_special_char = choice(any_char, /\-|\+/)
const any_char_or_special_char = new RegExp(`(${any_char.source}|\\-|\\+)`)

// const phrase_starting_with = (char) =>
// 	seq(
// 		seq(char, repeat(any_char_or_special_char)),
// 		repeat(seq(space, seq(any_char, repeat(any_char_or_special_char)))),
// 	)

const phrase_starting_with = (char) =>
	new RegExp(
		`(${char.source}${any_char_or_special_char.source}*)(${space.source}(${any_char.source}${any_char_or_special_char.source})*)*`,
	)

const rule_name = phrase_starting_with(letter)

const unit_symbol = /[°%\p{Sc}]/ // °, %, and all currency symbols (to be completed?)
const unit_identifier = phrase_starting_with(
	new RegExp(`${unit_symbol.source}|${letter.source}`),
)

const token = [
	createToken({ name: 'space', pattern: space }),
	createToken({ name: 'letter', pattern: letter }),
	createToken({ name: 'symbol', pattern: symbol }),
	createToken({ name: 'digit', pattern: digit }),
	createToken({ name: 'number', pattern: number }),
	createToken({ name: 'date', pattern: date }),
	createToken({ name: 'exposant', pattern: exposant }),
	createToken({ name: 'any_char', pattern: any_char }),
	createToken({
		name: 'any_char_or_special_char',
		pattern: any_char_or_special_char,
	}),
	createToken({ name: 'rule_name', pattern: rule_name }),
	createToken({ name: 'unit_identifier', pattern: unit_identifier }),
]

// const token = {
//   '(': createToken({name: '(', pattern: '(',}),
//   ')': createToken({name: ')', pattern: ')',}),
//   '[': createToken({name: '[', pattern: '[',}),
//   ']': createToken({name: ']', pattern: ']',}),
//   comparison: createToken({
//     name: 'comparison',
//      pattern: ['>','<','>=','<=','=','!='],
//   }),

//   date: createToken({ name:'date', pattern: new RegExp(dateRegexp)}),
// 	boolean: createToken({name:'boolean', pattern: /oui|non/}),
//   number: createToken({name:'number', pattern: new RegExp(numberRegExp)}),
//   word: createToken({ name:'word', pattern: new RegExp(word)}),
//   string: createToken({name:'string', pattern: /'.*'|".*"/}),
//   parentSelector: createToken({name:'parentSelector', pattern: "^"}),

//   additionSubstraction: createToken({name:'additionSubstraction', pattern: /\+-/}),
//   exponentiation: createToken({name:'exponentiation', pattern: '**'}),
//   multiplicationDivision: createToken({name:'multiplicationDivision', pattern: /\*|\/|\/\//}),
//   dot: createToken({name:'dot', pattern: ' . '}),
//   ".": createToken({name: '".":', pattern:'.'}),
//   space: { pattern: /[\s]+/ },

// });

class PublicodesParser extends CstParser {
	constructor() {
		super(token)

		this.RULE('expression', () => {
			return this.OR([
				{ ALT: () => this.SUBRULE(this.constant) },
				{ ALT: () => this.SUBRULE(this.reference) },
				{ ALT: () => this.SUBRULE(this.arExpression) },
				{ ALT: () => this.SUBRULE(this.boolExpression) },
			])
		})

		this.RULE('arExpression', () => {
			return this.SUBRULE(this.additionExpression)
		})

		this.RULE('additionExpression', () => {
			this.SUBRULE(this.multiplicationExpression)
			this.MANY(() => {
				this.OR([
					{ ALT: () => this.CONSUME('+') },
					{ ALT: () => this.CONSUME('-') },
				])
				this.SUBRULE2(this.multiplicationExpression)
			})
		})

		this.RULE('multiplicationExpression', () => {
			this.SUBRULE(this.exponentiationExpression)
			this.MANY(() => {
				this.OR([
					{ ALT: () => this.CONSUME('*') },
					{ ALT: () => this.CONSUME('/') },
					{ ALT: () => this.CONSUME('//') },
				])
				this.SUBRULE2(this.exponentiationExpression)
			})
		})

		this.RULE('exponentiationExpression', () => {
			this.SUBRULE(this.primaryExpression)
			this.MANY(() => {
				this.CONSUME('**')
				this.SUBRULE2(this.primaryExpression)
			})
		})

		this.RULE('primaryExpression', () => {
			return this.OR([
				{ ALT: () => this.SUBRULE(this.arUnaryExpression) },
				{
					ALT: () => {
						this.CONSUME('(')
						this.SUBRULE(this.arExpression)
						this.CONSUME(')')
					},
				},
				{ ALT: () => this.CONSUME('number') },
				{ ALT: () => this.SUBRULE(this.reference) },
			])
		})

		this.RULE('arUnaryExpression', () => {
			this.CONSUME('MINUS')
			this.SUBRULE(this.arExpression)
		})

		this.RULE('boolExpression', () => {
			return this.OR([
				{ ALT: () => this.CONSUME('boolean') },
				{ ALT: () => this.SUBRULE(this.comparison) },
				{ ALT: () => this.SUBRULE(this.reference) },
				{
					ALT: () => {
						this.CONSUME('(')
						this.SUBRULE2(this.boolExpression)
						this.CONSUME(')')
					},
				},
			])
		})

		this.RULE('comparison', () => {
			this.SUBRULE(this.expression)
			this.OR([
				{ ALT: () => this.CONSUME('=') },
				{ ALT: () => this.CONSUME('!=') },
				{ ALT: () => this.CONSUME('<') },
				{ ALT: () => this.CONSUME('<=') },
				{ ALT: () => this.CONSUME('>') },
				{ ALT: () => this.CONSUME('>=') },
			])
			this.SUBRULE2(this.expression)
		})

		this.performSelfAnalysis()
	}
}

const parser = new PublicodesParser()

function parseInput(text) {
	const lexingResult = parser.tokenize(text)
	// "input" is a setter which will reset the parser's state.
	parser.input = lexingResult.tokens
	parser.selectStatement()

	if (parser.errors.length > 0) {
		throw new Error('sad sad panda, Parsing errors detected')
	}
}

console.log(parseInput('10 + 3'))
