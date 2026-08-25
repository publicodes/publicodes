The type def should have priority over the inferred types:

  $ publicodes compile ./input/ -o - | ../../../scripts/get_rule_types.awk
  'simple value':
    value: ('foo'|'toot')
    type: "symbol",
  'infered enum':
    value: ('foo'|'toot')
    type: "symbol",
  'default value':
    value: ('foo'|'toot')
    type: "symbol",
  'with replacement':
    value: ('foo'|'bar'|'toot')
    type: "symbol",
