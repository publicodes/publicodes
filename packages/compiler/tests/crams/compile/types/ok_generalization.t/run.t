Should generalize the least precise side:

  $ publicodes compile ./input/ -o - | ../../../scripts/get_rule_types.awk
  'inferred from comparison . number with unit':
    value: number
    type: "number",
    unit: "euros",
  'inferred from comparison . boolean':
    value: boolean
    type: "boolean",
  'inferred from comparison . texte':
    value: text
    type: "text",
  'inferred from comparison . enum':
    value: ('toto'|'tutu')
    type: "symbol",
  'inferred from comparison . date':
    value: date
    type: "date",
  'inferred from comparison . enum 2':
    value: ('foo'|'bar')
    type: "symbol",
  'generalize to number . sum':
    value: number
    type: "number",
    unit: "l",
  'generalize to number . addition':
    value: number
    type: "number",
    unit: "l",
  'generalize to number . product':
    value: number
    type: "number",
    unit: "l^3",
  'generalize to number . max of':
    value: number
    type: "number",
    unit: "aucune",
  'generalize to number . power with unit':
    value: number
    type: "number",
    unit: "aucune",

