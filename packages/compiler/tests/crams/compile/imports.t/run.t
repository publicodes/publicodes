Nominal imports :

  $ publicodes compile subjects/ok -t debug_eval_tree -o -
  module a:
    get_context(module a)
  
  module a . regle a:
    10.
  
  module b:
    get_context(module b)
  
  module b . regle b:
    10.
  
  module c:
    get_context(module c)
  
  module c . regle c:
    get_context(module c . regle c)
  
  result:
    @module c . regle c

Check root exports :

  $ publicodes compile subjects/ok -t js -o - | awk '
  > /^ *$/ { next }
  > /const rules = {/ { enabled=1 }
  > /export default rules;/ { enabled=0 }
  > enabled { print }
  > '
  const rules = {
    'module c . regle c': {
      /**
       * Parameters of "module c . regle c"
       * @typedef {{
       *  'module c . regle c'?: number
       * }} module_c_·_regle_cParams
       */
      /**
       * Evaluate "module c . regle c" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: module_c_·_regle_cParams, options?: {Options}) => {value: number, needed: Array<keyof module_c_·_regle_cParams>, missing: Array<keyof module_c_·_regle_cParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_module_c_·_regle_c, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "module c . regle c"
       * @type {Array<keyof module_c_·_regle_cParams>}
       */
      params: ['module c . regle c'],
    },
    'result': {
      /**
       * Parameters of "result"
       * @typedef {{
       *  'module c . regle c'?: number
       * }} resultParams
       */
      /**
       * Evaluate "result" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: resultParams, options?: {Options}) => {value: number, needed: Array<keyof resultParams>, missing: Array<keyof resultParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_result, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "result"
       * @type {Array<keyof resultParams>}
       */
      params: ['module c . regle c'],
    }
  }

Cycle imports :

  $ publicodes compile subjects/cycle -t debug_eval_tree -o -
  E027
  cycle d'import détecté : cycle a/rules.publicodes <- cycle b/rules.publicodes <- cycle a/rules.publicodes <- subjects/cycle/main.publicodes
  [syntax error]
       ╒══  cycle b/rules.publicodes:2:13 ══
     1 │ cycle a:
     2 │   importer: cycle a
       │             ˘˘˘˘˘˘˘
  
  [123]

Private reference :
  $ publicodes compile subjects/private -t debug_eval_tree -o -
  E031 cette règle est privée [syntax error]
       ╒══  subjects/private/main.publicodes:4:6 ══
     3 │ 
     4 │ out: module b . regle b
       │      ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: La rêgle `module b . regle b` n'est pas
         exportée
   Hint: Ajouter l'attribut public sur la rêgle
         référencé
  [123]

Parent reference :
  $ publicodes compile subjects/parent -t debug_eval_tree -o -
  E032 cette règle n'est pas accessible [syntax
  error]
       ╒══  parent ref/rules.publicodes:2:11 ══
     1 │ regle d:
     2 │   valeur: parent ref
       │           ˘˘˘˘˘˘˘˘˘˘
   Hint: La rêgle `parent ref` n'est pas accessible
         depuis ce module
  [123]

Cross reference :
  $ publicodes compile subjects/cross -t debug_eval_tree -o -
  E032 cette règle n'est pas accessible [syntax
  error]
       ╒══  cross ref/rules.publicodes:2:11 ══
     1 │ regle e:
     2 │   valeur: module b . regle b
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: La rêgle `module b . regle b` n'est pas
         accessible depuis ce module
  [123]

Missing reference :
  $ PUBLICODESPATH=vendor publicodes compile subjects/missing -t debug_eval_tree -o -
  E033 la resource est introuvable [syntax error]
       ╒══  subjects/missing/rules.publicodes:2:13 ══
     1 │ module missing:
     2 │   importer: module missing
       │             ˘˘˘˘˘˘˘˘˘˘˘˘˘˘
  
  E033 la resource est introuvable [syntax error]
       ╒══  subjects/missing/rules.publicodes:7:14 ══
     6 │   importer:
     7 │     package: package missing
       │              ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
  
  E033 la resource est introuvable [syntax error]
       ╒══  subjects/missing/rules.publicodes:14:13 ══
    13 │     package: package a
    14 │     module: vendored missing
       │             ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
  
  E034 champ manquant : module [syntax error]
       ╒══  subjects/missing/rules.publicodes:18:3 ══
    17 │   valeur: rule vendored c + 3
    18 │   importer:
       │   ˘˘˘˘˘˘˘˘˘
  
  [123]

Vendor reference :
  $ PUBLICODESPATH=vendor publicodes compile subjects/vendored -t debug_eval_tree -o -
  out:
    @out . rule vendored a + 3.
  
  out . rule vendored a:
    @out . rule vendored a . rule vendored b
  
  out . rule vendored a . rule vendored b:
    10.
