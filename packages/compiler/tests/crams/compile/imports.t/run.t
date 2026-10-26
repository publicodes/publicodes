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

  $ publicodes compile subjects/ok -t js -o - | ../../scripts/get_rules.awk
  const rules = {
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
       * @type {(params?: resultParams, options?: Options) => {value: number, needed: Array<keyof resultParams>, missing: Array<keyof resultParams>, trace: Trace}}
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
    },
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
       * @type {(params?: module_c_·_regle_cParams, options?: Options) => {value: number, needed: Array<keyof module_c_·_regle_cParams>, missing: Array<keyof module_c_·_regle_cParams>, trace: Trace}}
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
    }
  }
  export const parameters = {
    'module c . regle c': rules['module c . regle c'],
  }
  export const outputs = {
    'result': rules['result'],
  }

Cycle imports :

  $ publicodes compile subjects/cycle -t debug_eval_tree -o -
  error[E027]: cycle d'import détecté
      ╒══ cycle a/rules.publicodes:2:13
    1 │  cycle b:
    2 │    importer: cycle b
      │              ˘˘˘˘˘˘˘ modèle 'cycle b' importé ici, début du cycle
    3 │  
      ╒══ cycle b/rules.publicodes:2:13
    1 │  cycle c:
    2 │    importer: cycle c
      │              ˘˘˘˘˘˘˘ modèle 'cycle c' importé ici
    3 │  
      ╒══ cycle c/rules.publicodes:2:13
    1 │  cycle a:
    2 │    importer: cycle a
      │              ˘˘˘˘˘˘˘ modèle 'cycle a' importé à nouveau ici
    3 │  
      ╒══ subjects/cycle/main.publicodes:2:13
    1 │  cycle a:
    2 │    importer: cycle a
      │              ˘˘˘˘˘˘˘ modèle 'cycle a' importé ici
    3 │  
  
  [123]

Private reference :
  $ publicodes compile subjects/private -t debug_eval_tree -o -
  error[E031]: cette règle est privée
      ╒══ subjects/private/main.publicodes:4:6
    3 │  
    4 │  out: module b . regle b
      │       ^^^^^^^^^^^^^^^^^^ cette règle est privée
    5 │  
      = (aide) La règle `module b . regle b` n'est pas exportée
      = (aide) Ajouter l'attribut « public: oui » sur la règle référencée
  
  [123]

Parent reference :
  $ publicodes compile subjects/parent -t debug_eval_tree -o -
  error[E032]: cette règle n'est pas accessible
      ╒══ parent ref/rules.publicodes:2:11
    1 │  regle d:
    2 │    valeur: parent ref
      │            ^^^^^^^^^^ cette règle n'est pas accessible
    3 │    public: oui
      = (aide) La règle `parent ref` n'est pas accessible depuis ce module
  
  [123]

Cross reference :
  $ publicodes compile subjects/cross -t debug_eval_tree -o -
  error[E032]: cette règle n'est pas accessible
      ╒══ cross ref/rules.publicodes:2:11
    1 │  regle e:
    2 │    valeur: module b . regle b
      │            ^^^^^^^^^^^^^^^^^^ cette règle n'est pas accessible
    3 │    public: oui
      = (aide) La règle `module b . regle b` n'est pas accessible depuis ce module
  
  [123]

Missing reference :
  $ PUBLICODESPATH=vendor publicodes compile subjects/missing -t debug_eval_tree -o -
  error[E033]: la resource est introuvable
      ╒══ subjects/missing/rules.publicodes:2:13
    1 │  module missing:
    2 │    importer: module missing
      │              ^^^^^^^^^^^^^^ la resource est introuvable
    3 │  
      = (aide) le chemin 'module missing' n'existe pas
  
  error[E033]: la resource est introuvable
      ╒══ subjects/missing/rules.publicodes:5:13
    4 │  module empty:
    5 │    importer: ./module empty
      │              ^^^^^^^^^^^^^^ la resource est introuvable
    6 │  
      = (aide) le dossier 'subjects/missing/module empty' est vide
  
  error[E033]: la resource est introuvable
      ╒══ subjects/missing/rules.publicodes:10:13
    9 │    importer:
   10 │      paquet: package missing
      │              ^^^^^^^^^^^^^^^ la resource est introuvable
   11 │      modèle: vendored a
      = (aide) le dossier n'a pas été trouvé dans aucun des emplacements suivants : 'vendor/package missing'
  
  error[E033]: la resource est introuvable
      ╒══ subjects/missing/rules.publicodes:17:13
   16 │      paquet: package a
   17 │      modèle: vendored missing
      │              ^^^^^^^^^^^^^^^^ la resource est introuvable
   18 │  
      = (aide) le chemin 'vendor/package a/vendored missing' n'existe pas
  
  error[E034]: champ manquant : modèle
      ╒══ subjects/missing/rules.publicodes:21:3
   20 │    valeur: rule vendored c + 3
   21 │    importer:
      │    ^^^^^^^^ champ manquant : modèle
   22 │      paquet: package a
  
  [123]

Vendor reference :
  $ PUBLICODESPATH=vendor publicodes compile subjects/vendored -t debug_eval_tree -o -
  out:
    @out . rule vendored a + 3.
  
  out . rule vendored a:
    @out . rule vendored a . rule vendored b
  
  out . rule vendored a . rule vendored b:
    10.

Vendor invalid reference :
  $ PUBLICODESPATH=vendor publicodes compile "subjects/vendored invalid" -t debug_eval_tree -o -
  error[E035]: chemin invalide
      ╒══ subjects/vendored invalid/main.publicodes:3:13
    2 │    valeur: rule vendored a + 3
    3 │    importer: foo/../bar # invalide
      │              ^^^^^^^^^^ chemin invalide
    4 │  
      = (aide) 'foo/../bar' n'est pas une valeur de modèle valide
  
  error[E035]: chemin invalide
      ╒══ subjects/vendored invalid/main.publicodes:8:13
    7 │    importer:
    8 │      paquet: ../node_modules/foo # invalide
      │              ^^^^^^^^^^^^^^^^^^^ chemin invalide
    9 │      modèle: bar
      = (aide) '../node_modules/foo' n'est pas une valeur de paquet valide
  
  error[E035]: chemin invalide
      ╒══ subjects/vendored invalid/main.publicodes:15:13
   14 │      paquet: package a
   15 │      modèle: bar/../toot # invalide
      │              ^^^^^^^^^^^ chemin invalide
   16 │  
      = (aide) 'bar/../toot' n'est pas une valeur de modèle valide
  
  error[E035]: chemin invalide
      ╒══ subjects/vendored invalid/main.publicodes:21:13
   20 │      paquet: package a
   21 │      modèle: bar/./toot # invalide
      │              ^^^^^^^^^^ chemin invalide
   22 │  
      = (aide) 'bar/./toot' n'est pas une valeur de modèle valide
  
  error[E035]: chemin invalide
      ╒══ subjects/vendored invalid/main.publicodes:26:13
   25 │    importer:
   26 │      paquet: ./foo # invalide
      │              ^^^^^ chemin invalide
   27 │      modèle: bar
      = (aide) './foo' n'est pas une valeur de paquet valide
  
  [123]

Module relative import :
  $ publicodes compile "subjects/relative" -t debug_eval_tree -o -
  out:
    @out . regle relative
  
  out . regle relative:
    20.
  
  out2:
    @out2 . regle relative
  
  out2 . regle relative:
    20.
  
  out3:
    @out3 . regle relative
  
  out3 . regle relative:
    @out3 . regle relative . regle relative 2
  
  out3 . regle relative . regle relative 2:
    30.

Module relative import with ./ :
  $ publicodes compile "./subjects/relative" -t debug_eval_tree -o -
  out:
    @out . regle relative
  
  out . regle relative:
    20.
  
  out2:
    @out2 . regle relative
  
  out2 . regle relative:
    20.
  
  out3:
    @out3 . regle relative
  
  out3 . regle relative:
    @out3 . regle relative . regle relative 2
  
  out3 . regle relative . regle relative 2:
    30.

Vendor relative import :
  $ PUBLICODESPATH=./vendor publicodes compile "subjects/vendored relative" -t debug_eval_tree -o -
  out:
    @out . rule vendored d
  
  out . rule vendored d:
    @out . rule vendored d . rule vendored e
  
  out . rule vendored d . rule vendored e:
    40.

Vendor distant :
  $ publicodes compile -C "subjects/distant/src" main -t debug_eval_tree -o -
  module a:
    get_context(module a)
  
  module a . rule a:
    10.
