Objet YAML malformé

  $ publicodes compile input
  error[E001]: impossible de déclarer un objet à cet endroit
      ╒══ input/rules.publicodes:2:3
    1 │    a:
    2 │ ╭    -1
    3 │ │    b: 5
      │ ╰────^ impossible de déclarer un objet à cet endroit
    4 │    
  
  [123]
