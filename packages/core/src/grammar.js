// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) {
	return x[0]
}

import {
	string,
	date,
	variable,
	binaryOperation,
	unaryOperation,
	boolean,
	number,
	numberWithUnit,
	JSONObject,
} from './grammarFunctions.js'
import moo from 'moo'

const dateRegexp = `(?:(?:0?[1-9]|[12][0-9]|3[01])\\/)?(?:0?[1-9]|1[012])\\/\\d{4}`
const letter = '[a-zA-Z\u00C0-\u017F€$%]'
const letterOrNumber = "[a-zA-Z\u00C0-\u017F0-9',°]"
const word = `${letter}(?:[-']?${letterOrNumber}+)*`

const numberRegExp = '-?(?:[1-9][0-9]+|[0-9])(?:\\.[0-9]+)?'
const lexer = moo.compile({
	'(': '(',
	')': ')',
	'[': '[',
	']': ']',
	comparison: ['>', '<', '>=', '<=', '=', '!='],
	date: new RegExp(dateRegexp),
	boolean: ['oui', 'non'],
	number: new RegExp(numberRegExp),
	word: new RegExp(word),
	string: [/'.*'/, /".*"/],
	JSONObject: /{.*}/,
	additionSubstraction: /[\+-]/,
	multiplicationDivision: ['*', '/'],
	dot: ' . ',
	'.': '.',
	space: { match: /[\s]+/, lineBreaks: true },
})

const join = (args) => ({ value: args.map((x) => x && x.value).join('') })
const flattenJoin = ([a, b]) => (Array.isArray(b) ? join([a, ...b]) : a)
let Lexer = lexer
let ParserRules = [
	{ name: 'main', symbols: ['Comparison'], postprocess: id },
	{ name: 'main', symbols: ['NumericValue'], postprocess: id },
	{ name: 'main', symbols: ['Date'], postprocess: id },
	{ name: 'main', symbols: ['NonNumericTerminal'], postprocess: id },
	{ name: 'main', symbols: ['JSONObject'], postprocess: id },
	{ name: 'NumericValue', symbols: ['AdditionSubstraction'], postprocess: id },
	{ name: 'NumericValue', symbols: ['Negation'], postprocess: id },
	{ name: 'NumericTerminal', symbols: ['Variable'], postprocess: id },
	{ name: 'NumericTerminal', symbols: ['number'], postprocess: id },
	{
		name: 'Negation',
		symbols: [
			{ literal: '-' },
			lexer.has('space') ? { type: 'space' } : space,
			'Parentheses',
		],
		postprocess: unaryOperation,
	},
	{
		name: 'Parentheses',
		symbols: [
			{ literal: '(' },
			lexer.has('space') ? { type: 'space' } : space,
			'NumericValue',
			lexer.has('space') ? { type: 'space' } : space,
			{ literal: ')' },
		],
		postprocess: ([, , e]) => e,
	},
	{
		name: 'Parentheses',
		symbols: [{ literal: '(' }, 'NumericValue', { literal: ')' }],
		postprocess: ([, e]) => e,
	},
	{ name: 'Parentheses', symbols: ['NumericTerminal'], postprocess: id },
	{ name: 'Date', symbols: ['Variable'], postprocess: id },
	{
		name: 'Date',
		symbols: [lexer.has('date') ? { type: 'date' } : date],
		postprocess: date,
	},
	{
		name: 'Comparison',
		symbols: [
			'Comparable',
			lexer.has('space') ? { type: 'space' } : space,
			lexer.has('comparison') ? { type: 'comparison' } : comparison,
			lexer.has('space') ? { type: 'space' } : space,
			'Comparable',
		],
		postprocess: binaryOperation,
	},
	{
		name: 'Comparison',
		symbols: [
			'Date',
			lexer.has('space') ? { type: 'space' } : space,
			lexer.has('comparison') ? { type: 'comparison' } : comparison,
			lexer.has('space') ? { type: 'space' } : space,
			'Date',
		],
		postprocess: binaryOperation,
	},
	{ name: 'Comparable$subexpression$1', symbols: ['AdditionSubstraction'] },
	{ name: 'Comparable$subexpression$1', symbols: ['NonNumericTerminal'] },
	{
		name: 'Comparable',
		symbols: ['Comparable$subexpression$1'],
		postprocess: ([[e]]) => e,
	},
	{
		name: 'NonNumericTerminal',
		symbols: [lexer.has('boolean') ? { type: 'boolean' } : boolean],
		postprocess: boolean,
	},
	{
		name: 'NonNumericTerminal',
		symbols: [lexer.has('string') ? { type: 'string' } : string],
		postprocess: string,
	},
	{ name: 'Variable$ebnf$1', symbols: [] },
	{
		name: 'Variable$ebnf$1$subexpression$1',
		symbols: [lexer.has('dot') ? { type: 'dot' } : dot, 'Words'],
		postprocess: join,
	},
	{
		name: 'Variable$ebnf$1',
		symbols: ['Variable$ebnf$1', 'Variable$ebnf$1$subexpression$1'],
		postprocess: function arrpush(d) {
			return d[0].concat([d[1]])
		},
	},
	{
		name: 'Variable',
		symbols: ['Words', 'Variable$ebnf$1'],
		postprocess: (x) => variable(flattenJoin(x)),
	},
	{
		name: 'Words$ebnf$1$subexpression$1$ebnf$1',
		symbols: [lexer.has('space') ? { type: 'space' } : space],
		postprocess: id,
	},
	{
		name: 'Words$ebnf$1$subexpression$1$ebnf$1',
		symbols: [],
		postprocess: function (d) {
			return null
		},
	},
	{
		name: 'Words$ebnf$1$subexpression$1',
		symbols: ['Words$ebnf$1$subexpression$1$ebnf$1', 'WordOrNumber'],
		postprocess: join,
	},
	{ name: 'Words$ebnf$1', symbols: ['Words$ebnf$1$subexpression$1'] },
	{
		name: 'Words$ebnf$1$subexpression$2$ebnf$1',
		symbols: [lexer.has('space') ? { type: 'space' } : space],
		postprocess: id,
	},
	{
		name: 'Words$ebnf$1$subexpression$2$ebnf$1',
		symbols: [],
		postprocess: function (d) {
			return null
		},
	},
	{
		name: 'Words$ebnf$1$subexpression$2',
		symbols: ['Words$ebnf$1$subexpression$2$ebnf$1', 'WordOrNumber'],
		postprocess: join,
	},
	{
		name: 'Words$ebnf$1',
		symbols: ['Words$ebnf$1', 'Words$ebnf$1$subexpression$2'],
		postprocess: function arrpush(d) {
			return d[0].concat([d[1]])
		},
	},
	{
		name: 'Words',
		symbols: ['WordOrKeyword', 'Words$ebnf$1'],
		postprocess: flattenJoin,
	},
	{
		name: 'Words',
		symbols: [lexer.has('word') ? { type: 'word' } : word],
		postprocess: id,
	},
	{
		name: 'WordOrKeyword',
		symbols: [lexer.has('word') ? { type: 'word' } : word],
		postprocess: id,
	},
	{
		name: 'WordOrKeyword',
		symbols: [lexer.has('boolean') ? { type: 'boolean' } : boolean],
		postprocess: id,
	},
	{ name: 'WordOrNumber', symbols: ['WordOrKeyword'], postprocess: id },
	{
		name: 'WordOrNumber',
		symbols: [lexer.has('number') ? { type: 'number' } : number],
		postprocess: id,
	},
	{
		name: 'UnitDenominator$ebnf$1$subexpression$1',
		symbols: [lexer.has('space') ? { type: 'space' } : space],
	},
	{
		name: 'UnitDenominator$ebnf$1',
		symbols: ['UnitDenominator$ebnf$1$subexpression$1'],
		postprocess: id,
	},
	{
		name: 'UnitDenominator$ebnf$1',
		symbols: [],
		postprocess: function (d) {
			return null
		},
	},
	{
		name: 'UnitDenominator',
		symbols: ['UnitDenominator$ebnf$1', { literal: '/' }, 'Words'],
		postprocess: join,
	},
	{
		name: 'UnitNumerator$ebnf$1$subexpression$1',
		symbols: [{ literal: '.' }, 'Words'],
	},
	{
		name: 'UnitNumerator$ebnf$1',
		symbols: ['UnitNumerator$ebnf$1$subexpression$1'],
		postprocess: id,
	},
	{
		name: 'UnitNumerator$ebnf$1',
		symbols: [],
		postprocess: function (d) {
			return null
		},
	},
	{
		name: 'UnitNumerator',
		symbols: ['Words', 'UnitNumerator$ebnf$1'],
		postprocess: flattenJoin,
	},
	{ name: 'Unit$ebnf$1', symbols: ['UnitNumerator'], postprocess: id },
	{
		name: 'Unit$ebnf$1',
		symbols: [],
		postprocess: function (d) {
			return null
		},
	},
	{ name: 'Unit$ebnf$2', symbols: [] },
	{
		name: 'Unit$ebnf$2',
		symbols: ['Unit$ebnf$2', 'UnitDenominator'],
		postprocess: function arrpush(d) {
			return d[0].concat([d[1]])
		},
	},
	{
		name: 'Unit',
		symbols: ['Unit$ebnf$1', 'Unit$ebnf$2'],
		postprocess: flattenJoin,
	},
	{
		name: 'AdditionSubstraction',
		symbols: [
			'AdditionSubstraction',
			lexer.has('space') ? { type: 'space' } : space,
			lexer.has('additionSubstraction') ?
				{ type: 'additionSubstraction' }
			:	additionSubstraction,
			lexer.has('space') ? { type: 'space' } : space,
			'MultiplicationDivision',
		],
		postprocess: binaryOperation,
	},
	{
		name: 'AdditionSubstraction',
		symbols: ['MultiplicationDivision'],
		postprocess: id,
	},
	{
		name: 'MultiplicationDivision',
		symbols: [
			'MultiplicationDivision',
			lexer.has('space') ? { type: 'space' } : space,
			lexer.has('multiplicationDivision') ?
				{ type: 'multiplicationDivision' }
			:	multiplicationDivision,
			lexer.has('space') ? { type: 'space' } : space,
			'Parentheses',
		],
		postprocess: binaryOperation,
	},
	{ name: 'MultiplicationDivision', symbols: ['Parentheses'], postprocess: id },
	{
		name: 'number',
		symbols: [lexer.has('number') ? { type: 'number' } : number],
		postprocess: number,
	},
	{
		name: 'number$ebnf$1$subexpression$1',
		symbols: [lexer.has('space') ? { type: 'space' } : space],
	},
	{
		name: 'number$ebnf$1',
		symbols: ['number$ebnf$1$subexpression$1'],
		postprocess: id,
	},
	{
		name: 'number$ebnf$1',
		symbols: [],
		postprocess: function (d) {
			return null
		},
	},
	{
		name: 'number',
		symbols: [
			lexer.has('number') ? { type: 'number' } : number,
			'number$ebnf$1',
			'Unit',
		],
		postprocess: numberWithUnit,
	},
	{
		name: 'JSONObject',
		symbols: [lexer.has('JSONObject') ? { type: 'JSONObject' } : JSONObject],
		postprocess: JSONObject,
	},
]
let ParserStart = 'main'
export default { Lexer, ParserRules, ParserStart }
