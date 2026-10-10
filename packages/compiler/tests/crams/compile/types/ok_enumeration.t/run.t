Replacements should be correctly be inferred in enumerations:

  $ publicodes compile ./input/ -o - | ../../../scripts/get_rule_types.awk
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./input/rules.publicodes:31:1 ══
    30 │   public: oui
    31 │ c4: # type unknown
       │ ˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         c4:
           type: nombre
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./input/rules.publicodes:79:5 ══
    78 │       valeur: c
    79 │     c: # type unknown
       │     ˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         same rule replaced with different types . c:
           type: nombre
  'a1':
    value: (10.000000|20.000000)
    type: "number",
    unit: "euros",
  'c1':
    value: 20.000000
    type: "number",
    unit: "euros",
  'a2':
    value: (10.000000|20.000000|30.000000)
    type: "number",
    unit: "aucune",
  'a3':
    value: (10.000000|20.000000)
    type: "number",
    unit: "aucune",
  'a4':
    value: "foo"
    type: "text",
  'b4':
    value: 42.000000
    type: "number",
    unit: "aucune",
  'simple replacement . a':
    value: (10.000000|20.000000)
    type: "number",
    unit: "euros",
  'simple replacement . c':
    value: 20.000000
    type: "number",
    unit: "euros",
  'simple variation':
    value: (10.000000|20.000000|30.000000)
    type: "number",
    unit: "aucune",
  'by default':
    value: (10.000000|20.000000)
    type: "number",
    unit: "aucune",
  'same rule replaced with different types . a':
    value: "foo"
    type: "text",
  'same rule replaced with different types . b':
    value: 42.000000
    type: "number",
    unit: "aucune",
  'generalization of an enum . simple literal':
    value: 1.000000
    type: "number",
    unit: "aucune",
  'generalization of an enum . sum':
    value: number
    type: "number",
    unit: "aucune",
  'inferred enum could be a subset of the explicit type':
    value: ('foo'|'bar'|'toot')
    type: "symbol",
  'inferred enum from variation with context':
    value: ('foo'|'bar'|'too'|'zoo'|'tutu')
    type: "symbol",
  'inferred enum from variation with context . enum':
    value: ('foo'|'bar'|'too'|'zoo'|'tutu'|'default')
    type: "symbol",
  'c4':
    value: unknown
    type: "unknown",
  'same rule replaced with different types . c':
    value: unknown
    type: "unknown",
