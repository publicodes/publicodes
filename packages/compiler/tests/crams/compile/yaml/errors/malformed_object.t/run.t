Objet YAML malformé

  $ publicodes compile input
  E001
  impossible de déclarer un objet à cet endroit [yaml error]
       ╒══  input/rules.publicodes:2:3 ══
     1 │ a:
     2 │   -1
       │   ˘˘
     3 │   b: 5
       │ ˘˘˘˘
  
  [123]
