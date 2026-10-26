Valid metas :

  $ publicodes compile valid-metas  -t debug_eval_tree -o -
  a:
    5.
  
  b:
    5. €


Invalid metas :

  $ publicodes compile invalid-metas  -t debug_eval_tree -o -
  error[E017]: mécanisme invalide
      ╒══ invalid-metas/rules.publicodes:4:3
    3 │    public: oui
    4 │    références:  # Invalid, put in a meta tag
      │    ^^^^^^^^^^ mécanisme invalide
    5 │      - Ma référence
  
  error[E030]: meta invalide
      ╒══ invalid-metas/rules.publicodes:11:5
   10 │    meta:
   11 │      titre: bla # Invalid, put at the root of the rule
      │      ^^^^^ titre
   12 │    valeur: 1
  
  [123]
