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
  E039
  aucune règle trouvée dans le fichier ou le stream [yaml error]
       ╒══  empty_file/rules.publicodes:1:1 ══
  
  [123]

Affiche une erreur si le stream stdin est vide :

  $ publicodes compile -
  E039
  aucune règle trouvée dans le fichier ou le stream [yaml error]
  <no
  source
  available>
  
  [123]
