Should have error when type don't match:
(FIXME: should have a main position pointing to the comparison expression)

  $ publicodes compile ./type_mismatch/ -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./type_mismatch/rules.publicodes:4:8 ══
     3 │   avec:
     4 │     a: "Test"
       │        ˘˘˘˘˘˘ est un texte
       ╒══  ./type_mismatch/rules.publicodes:5:8 ══
     4 │     a: "Test"
     5 │     b: 12
       │        ˘˘ est un nombre
  
  [123]

Should correctly report missing type information for public rules:
(FIXME: should have better positions for the rule `résultat`)

  $ publicodes compile ./missing_type/ 
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./missing_type/rules.publicodes:1:1 ══
     1 │ paramètre seul: # manque l'information de type
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         paramètre seul:
           type: nombre
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./missing_type/rules.publicodes:8:1 ══
     7 │ 
     8 │ résultat paramètre:
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         résultat paramètre:
           type: nombre
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./missing_type/rules.publicodes:6:11 ══
     5 │   public: oui
     6 │   valeur: résultat paramètre
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         résultat:
           type: nombre
