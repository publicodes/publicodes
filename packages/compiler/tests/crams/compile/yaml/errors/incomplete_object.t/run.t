NOTE: pour l'instant les positions des erreurs YAML ne sont pas bonnes. Cela est
dû à la façon dont nous avons implémenté le parser YAML qui est basé sur le
`Yaml.Stream` et qui ne permet pas d'avoir la position de l'erreur sauf en la
récupérant d'offset dans le message d'erreur lui-même.

Pour l'instant c'est fonctionnalité YAML n'étant pas gérée en Publicodes, nous
considérons que ce n'est pas encore justifié de passer trop de temps dessus et
quelles sont acceptables.

Objet incomplet #1

  $ publicodes compile input
  error[E001]: caractère `:` non valide à cet endroit
      ╒══ input/rules.publicodes:1:1
    1 │  {a:, b}
      │  ^ caractère `:` non valide à cet endroit
    2 │  
  
  [123]

Objet incomplet #2

  $ publicodes compile input2
  error[E001]: l'objet n'est pas fermé
      ╒══ input2/rules.publicodes:3:1
    2 │  - 14
    3 │  
      │  ^ l'objet n'est pas fermé
      = il manque  `}` pour le fermer, ou `,` pour ajouter un élément
  
  [123]
