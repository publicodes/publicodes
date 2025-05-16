open Ast
open Core
open Parse
open Utils
open Utils.Output

let%test_unit "parse scalar" =
  let str = "scalar" in
  let output = parse "test" str in
  match result output with
  | Some yaml ->
      [%test_eq: yaml] yaml
        (`Scalar
           ( {value= "scalar"; style= `Plain}
           , { start_pos= Pos.Point.dummy
             ; end_pos=
                 { line= 1
                 ; column= 1 + String.length str
                 ; index= String.length str }
             ; file= "test" } ) )
  | None ->
      print_logs output ;
      assert false

let%test_unit "parse obj" =
  let str = {|
  ma règle:
  b:
    2
  |} in
  let output = parse "test" str in
  match result output with
  | Some yaml ->
      [%test_eq: yaml] yaml
        (`O
           [ (* Key *)
             ( ( {value= "ma règle"; style= `Plain}
               , { start_pos= {line= 2; column= 3; index= 3}
                 ; end_pos= {line= 2; column= 11; index= 11}
                 ; file= "test" } )
             , (* Value *)
               `Scalar
                 ( {value= ""; style= `Plain}
                 , { start_pos= {line= 2; column= 12; index= 12}
                   ; end_pos= {line= 2; column= 12; index= 12}
                   ; file= "test" } ) )
           ; (* Key *)
             ( ( {value= "b"; style= `Plain}
               , { start_pos= {line= 3; column= 3; index= 15}
                 ; end_pos= {line= 3; column= 4; index= 16}
                 ; file= "test" } )
             , (* Value *)
               `Scalar
                 ( {value= "2"; style= `Plain}
                 , { start_pos= {line= 4; column= 5; index= 22}
                   ; end_pos= {line= 4; column= 6; index= 23}
                   ; file= "test" } ) ) ] )
  | None ->
      print_logs output ;
      assert false

let%test_unit "parse array" =
  let str = "[a, 'a . b',1.4]" in
  let output = parse "test" str in
  match result output with
  | Some yaml ->
      [%test_eq: yaml] yaml
        (`A
           [ `Scalar
               ( {value= "a"; style= `Plain}
               , { start_pos= {line= 1; column= 2; index= 1}
                 ; end_pos= {line= 1; column= 3; index= 2}
                 ; file= "test" } )
           ; `Scalar
               ( {value= "a . b"; style= `Single_quoted}
               , { start_pos= {line= 1; column= 5; index= 4}
                 ; end_pos= {line= 1; column= 12; index= 11}
                 ; file= "test" } )
           ; `Scalar
               ( {value= "1.4"; style= `Plain}
               , { start_pos= {line= 1; column= 13; index= 12}
                 ; end_pos= {line= 1; column= 16; index= 15}
                 ; file= "test" } ) ] )
  | None ->
      print_logs output ;
      assert false

let%test_unit "parse error : malformed object" =
  let str = {|
a:
  -1
  b: 5
|} in
  let output = parse "test" str in
  [%test_eq: yaml option] (result output) None ;
  [%test_eq: string list]
    (output |> logs |> List.map ~f:Log.message)
    ["Impossible de déclarer un objet à cet endroit"]

let%test_unit "parse error: not allowed char" =
  let str = "'" in
  let output = parse "test" str in
  [%test_eq: yaml option] (result output) None ;
  [%test_eq: string list]
    (output |> logs |> List.map ~f:Log.message)
    ["Fin de fichier inattendue : il manque un caractère"]

(* assert false *)

let%test_unit "parse error: incomplete array" =
  let str = {|
    a: [a, b,c
    b:
  |} in
  let output = parse "test" str in
  [%test_eq: yaml option] (result output) None ;
  [%test_eq: string list]
    (output |> logs |> List.map ~f:Log.message)
    ["Le tableau n'est pas fermé"]

let%test_unit "parse error: incomplete object" =
  let str = {|
    {a:, b}
  |} in
  let output = parse "test" str in
  [%test_eq: yaml option] (result output) None ;
  [%test_eq: string list]
    (output |> logs |> List.map ~f:Log.message)
    ["`:` non valide à cet endroit"]

let%test_unit "parse error: incomplete object" =
  let str = {|
    - {a:4, b
    - 14
  |} in
  let output = parse "test" str in
  [%test_eq: yaml option] (result output) None ;
  [%test_eq: string list]
    (output |> logs |> List.map ~f:Log.message)
    ["L'objet n'est pas fermé"]
