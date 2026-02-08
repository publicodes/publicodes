Valid metas :

  $ publicodes compile valid-metas.publicodes  -t debug_eval_tree -o -
  a :
  5.
  
  b :
  5. €


Invalid metas :

  $ publicodes compile invalid-metas.publicodes  -t debug_eval_tree -o -
  E017 mécanisme invalide [syntax error]
       ╒══  invalid-metas.publicodes:4:3 ══
     3 │   public: oui
     4 │   références:  # Invalid, put in a meta tag
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: La clé `références` n'est pas valide
   Hint: Utilisez la clé 'meta' pour ajouter des
         propriétés personnalisées à une règle
  E030 meta invalide [syntax error]
       ╒══  invalid-metas.publicodes:11:5 ══
    10 │   meta:
    11 │     titre: bla # Invalid, put at the root of the rule
       │     ˘˘˘˘˘˘ titre
   Hint: Cette méta doit être déplacée à la racine de
         la règle
  [123]
