Affiche une erreur si le dossier n'existe pas :

  $ publicodes compile absent
  Error: Path does not exists
  [124]

Affiche une erreur si le dossier est vide :

  $ publicodes compile empty
  Error: Directory does not contains Publicodes files
  [124]

Affiche une erreur si le fichier est vide :

  $ publicodes compile empty_file
  error[E039]: aucune règle trouvée dans le fichier ou le stream
      ╒══ empty_file/rules.publicodes:1:1
    1 │  
      │  ^ aucune règle trouvée dans le fichier ou le stream
  
  [123]

Affiche une erreur si le stream stdin est vide :

  $ publicodes compile -
  error[E039]: aucune règle trouvée dans le fichier ou le stream
      ╒══ unknown:1:1
    1 │  
      │  ^ aucune règle trouvée dans le fichier ou le stream
  
  [123]
