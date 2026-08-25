Should correctly infer types from context usage:

  $ publicodes compile ./input/ -o - | ../../../scripts/get_rule_types.awk
  'simple ok':
    value: 4.000000
    type: "number",
    unit: "euros",
  'simple ok . ref':
    value: number
    type: "number",
    unit: "euros",
  'nested ok':
    value: number
    type: "number",
    unit: "euros",
  'nested ok . ref':
    value: number
    type: "number",
    unit: "euros",
