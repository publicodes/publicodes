import chevrotain from 'chevrotain';

const space =
    /[\t\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/;
const letter = /[a-zA-Z\u00C0-\u017F]/;
const symbol = prec(0, /[',°€%²$_’"«»]/); // TODO: add parentheses
const digit = /\d/;

const number = /\d+(\.\d+)?/;
const date = /(?:(?:0?[1-9]|[12][0-9]|3[01])\/)?(?:0?[1-9]|1[012])\/\d{4}/;
const exposant = /[⁰-⁹]+/;


const any_char = choice(letter, symbol, digit);
const any_char_or_special_char = choice(any_char, /\-|\+/);

const phrase_starting_with = (char) =>
    seq(
        seq(char, repeat(any_char_or_special_char)),
        repeat(seq(space, seq(any_char, repeat(any_char_or_special_char))))
    );

const rule_name = token(phrase_starting_with(letter));

const unit_symbol = /[°%\p{Sc}]/; // °, %, and all currency symbols (to be completed?)
const unit_identifier = token.immediate(
    phrase_starting_with(choice(unit_symbol, letter))
);

const token = {
  '(': createToken({name: '(', pattern: '(',}),
  ')': createToken({name: ')', pattern: ')',}),
  '[': createToken({name: '[', pattern: '[',}),
  ']': createToken({name: ']', pattern: ']',}),
  comparison: createToken({
    name: 'comparison',
     pattern: ['>','<','>=','<=','=','!='],
  }),

  date: createToken({ name:'date', pattern: new RegExp(dateRegexp)}),
	boolean: createToken({name:'boolean', pattern: /oui|non/}),
  number: createToken({name:'number', pattern: new RegExp(numberRegExp)}),
  word: createToken({ name:'word', pattern: new RegExp(word)}),
  string: createToken({name:'string', pattern: /'.*'|".*"/}),
  parentSelector: createToken({name:'parentSelector', pattern: "^"}),

  additionSubstraction: createToken({name:'additionSubstraction', pattern: /\+-/}),
  exponentiation: createToken({name:'exponentiation', pattern: '**'}),
  multiplicationDivision: createToken({name:'multiplicationDivision', pattern: /\*|\/|\/\//}),
  dot: createToken({name:'dot', pattern: ' . '}),
  ".": createToken({name: '".":', pattern:'.'}),
  space: { pattern: /[\s]+/ },
  
});
