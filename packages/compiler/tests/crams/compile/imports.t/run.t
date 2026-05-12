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


Cycle imports :

  $ publicodes compile subjects/cycle -t debug_eval_tree -o -
  E030
  cycle d'import détecté : cycle a/rules.publicodes <- cycle b/rules.publicodes <- cycle a/rules.publicodes <- subjects/cycle/main.publicodes
  [syntax error]
       ╒══  cycle b/rules.publicodes:2:3 ══
     1 │ cycle a:
     2 │   importer: cycle a
       │   ˘˘˘˘˘˘˘˘˘
  
  [123]

Private reference :
  $ publicodes compile subjects/private -t debug_eval_tree -o -
  E032 cette règle est privée [syntax error]
       ╒══  subjects/private/main.publicodes:4:6 ══
     3 │ 
     4 │ out: module b . regle b
       │      ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: La rêgle `module b . regle b` est privée
   Hint: Ajouter l'attribut public sur la rêgle
         référencé
  [123]

Parent reference :
  $ publicodes compile subjects/parent -t debug_eval_tree -o -
  E033 cette règle n'est pas accessible [syntax
  error]
       ╒══  parent ref/rules.publicodes:2:11 ══
     1 │ regle c:
     2 │   valeur: parent ref
       │           ˘˘˘˘˘˘˘˘˘˘
   Hint: La rêgle `parent ref` n'est pas accessible
         depuis ce module
  [123]

Cross reference :
  $ publicodes compile subjects/cross -t debug_eval_tree -o -
  E033 cette règle n'est pas accessible [syntax
  error]
       ╒══  cross ref/rules.publicodes:2:11 ══
     1 │ regle d:
     2 │   valeur: module b . regle b
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: La rêgle `module b . regle b` n'est pas
         accessible depuis ce module
  [123]
