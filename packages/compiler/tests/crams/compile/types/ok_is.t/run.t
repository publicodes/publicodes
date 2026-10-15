Type inference should be ok:

  $ publicodes compile ./input/ -o - | ../../../scripts/get_rule_types.awk
  'a':
    value: boolean
    type: "boolean",
  'a1':
    value: boolean
    type: "boolean",
  'a2':
    value: boolean
    type: "boolean",
  'a3':
    value: boolean
    type: "boolean",
