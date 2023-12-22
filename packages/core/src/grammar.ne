# This grammar is inspired by the "fancier grammar" tab of the nearley playground : https://omrelli.ug/nearley-playground

# Look for the PEMDAS system : Parentheses, Exponents (omitted here), Multiplication, and you should guess the rest :)

# IMPORTANT : this file is not watched by the build system, use `yarn run build:grammar` to update the js file.

@preprocessor esmodule

@{%
import {
  string, date, variable, binaryOperation, unaryOperation, boolean, number, numberWithUnit, JSONObject
} from './grammarFunctions.js';
import moo from "moo";


const dateRegexp = `(?:(?:0?[1-9]|[12][0-9]|3[01])\\/)?(?:0?[1-9]|1[012])\\/\\d{4}`
const letter = '[a-zA-Z\u00C0-\u017F€$%°]';
const letterOrNumber = '[a-zA-Z\u00C0-\u017F0-9\',]';
const word = `${letter}(?:[-']?${letterOrNumber}+)*`;

const numberRegExp = '-?(?:[1-9][0-9]+|[0-9])(?:\\.[0-9]+)?';
const lexer = moo.compile({
  '(': '(',
  ')': ')',
  '[': '[',
  ']': ']',
  comparison: ['>','<','>=','<=','=','!='],
  date: new RegExp(dateRegexp),
	boolean: ['oui','non'],
  number: new RegExp(numberRegExp),
  word:  new RegExp(word),
  string: [/'.*'/, /".*"/],
  parentSelector: "^",
  JSONObject: /{.*}/,
  additionSubstraction: /[\+-]/,
  multiplicationDivision: ['*','/'],
  dot: ' . ',
  ".": '.',
  space: { match: /[\s]+/, lineBreaks: true },
});

const join = (args) => ({value: (args.map(x => x && x.value).join(""))})
const flattenJoin = (args) => join(args.flat())
%}

@lexer lexer

main ->
    Comparison {% id %}
  | NumericValue {% id %}
  | Date {% id %}
  | NonNumericTerminal {% id %}
  | JSONObject {% id %}

NumericValue ->
    AdditionSubstraction {% id %}
  | Negation {% id %}

NumericTerminal ->
    Variable {% id %}
  | number {% id %}

Negation ->
    "-" %space Parentheses {% unaryOperation %}

Parentheses ->
  "(" %space NumericValue %space ")"  {% ([,,e]) => e %}
  | "(" NumericValue ")"  {% ([,e]) => e %}
  |  NumericTerminal               {% id %}

Date ->
    Variable {% id %}
  | %date {% date %}

Comparison ->
    Comparable %space %comparison %space Comparable {% binaryOperation %}
  | Date %space %comparison %space Date {% binaryOperation %}

Comparable -> (AdditionSubstraction | NonNumericTerminal) {% ([[e]]) => e %}

NonNumericTerminal ->
    %boolean  {% boolean %}
  | %string   {% string %}

Variable -> 
    VariableWithoutParentSelector {% ([x]) => variable(x) %} 
  | (%parentSelector %dot {% join %}):* VariableWithoutParentSelector {% x => variable(flattenJoin(x)) %}

VariableWithoutParentSelector -> 
    Words (%dot Words {% join %}):* {% x => flattenJoin(x) %}

Words ->
	  WordOrKeyword (%space:? WordOrNumber {% join %}):+ {% flattenJoin %}
	| %word {% id %}

WordOrKeyword ->
	  %word {% id %}
	| %boolean {% id %}

WordOrNumber ->
	  WordOrKeyword {% id %}
	| %number {% id %}


UnitDenominator ->
  (%space):? "/" Words {% join %}
UnitNumerator -> Words ("." Words):? {% flattenJoin %}

Unit -> UnitNumerator:? UnitDenominator:* {% flattenJoin %}

AdditionSubstraction ->
    AdditionSubstraction %space %additionSubstraction %space MultiplicationDivision  {%  binaryOperation  %}
  | MultiplicationDivision  {% id %}

MultiplicationDivision ->
    MultiplicationDivision %space %multiplicationDivision %space Parentheses  {% binaryOperation  %}
  | Parentheses   {% id %}




number ->
    %number {% number %}
  | %number (%space):? Unit {% numberWithUnit %}


JSONObject -> %JSONObject {% JSONObject %}
