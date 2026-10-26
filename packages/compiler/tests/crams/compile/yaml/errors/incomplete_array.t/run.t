Tableau non fermé

  $ publicodes compile input
  error[E001]: le tableau n'est pas fermé
      ╒══ input/rules.publicodes:1:10
    1 │    a: [a, b,c
      │ ╭───────────^
    2 │ │  b:
      │ ╰──^ le tableau n'est pas fermé
    3 │    
      = il manque  `]` pour le fermer, ou `,` pour ajouter un élément
  
  [123]
