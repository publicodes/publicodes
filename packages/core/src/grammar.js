import { createToken } from 'chevrotain'

const space =
	/[\t\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/
const letter = /[a-zA-Z\u00C0-\u017F]/
const symbol = /[',°€%²$_’"«»]/
// const symbol = prec(0, /[',°€%²$_’"«»]/) // TODO: add parentheses
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
const unit_identifier =
	phrase_starting_with(new RegExp(`${unit_symbol.source}|${letter.source}`)),

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
