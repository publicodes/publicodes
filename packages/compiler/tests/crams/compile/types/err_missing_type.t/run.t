Seould correctly report missing type information for public rules:

  $ publicodes compile ./input/
  error[E024]: information de type manquante pour ce résultat
      ╒══ ./input/rules.publicodes:1:1
    1 │  paramètre seul: # manque l'information de type
      │  ^^^^^^^^^^^^^^ information de type manquante pour ce résultat
    2 │    public: oui
  
  error[E024]: information de type manquante pour ce résultat
      ╒══ ./input/rules.publicodes:4:1
    3 │  
    4 │  résultat:
      │  ^^^^^^^^ information de type manquante pour ce résultat
    5 │    public: oui
  
  error[E024]: information de type manquante pour ce résultat
      ╒══ ./input/rules.publicodes:8:1
    7 │  
    8 │  résultat paramètre:
      │  ^^^^^^^^^^^^^^^^^^ information de type manquante pour ce résultat
    9 │  
  

