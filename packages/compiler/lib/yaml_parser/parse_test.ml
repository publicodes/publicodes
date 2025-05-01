open Ast
open Core
open Parse
open Utils

let%test_unit "parse scalar" =
  let str = "scalar" in
  let parsed_yaml = parse "test" str in
  match parsed_yaml with
  | Ok yaml ->
      [%test_eq: yaml] yaml
        (`Scalar
           ( { value = "scalar"; style = `Plain },
             {
               start_pos = (1, 1);
               end_pos = (1, 1 + String.length str);
               file = "test";
             } ))
  | Error err ->
      Format.printf "%a" Log.pp err;
      assert false

let%test_unit "parse obj" =
  let str = {|
  ma règle:
  b:
    2
  |} in
  let parsed_yaml = parse "test" str in
  match parsed_yaml with
  | Ok yaml ->
      [%test_eq: yaml] yaml
        (`O
           [
             (* Key *)
             ( ( { value = "ma règle"; style = `Plain },
                 { start_pos = (2, 3); end_pos = (2, 11); file = "test" } ),
               (* Value *)
               `Scalar
                 ( { value = ""; style = `Plain },
                   { start_pos = (2, 12); end_pos = (2, 12); file = "test" } )
             );
             (* Key *)
             ( ( { value = "b"; style = `Plain },
                 { start_pos = (3, 3); end_pos = (3, 4); file = "test" } ),
               (* Value *)
               `Scalar
                 ( { value = "2"; style = `Plain },
                   { start_pos = (4, 5); end_pos = (4, 6); file = "test" } ) );
           ])
  | Error err ->
      Format.printf "%a" Log.pp err;
      assert false

let%test_unit "parse array" =
  let str = "[a, 'a . b',1.4]" in
  let parsed_yaml = parse "test" str in
  match parsed_yaml with
  | Ok yaml ->
      [%test_eq: yaml] yaml
        (`A
           [
             `Scalar
               ( { value = "a"; style = `Plain },
                 { start_pos = (1, 2); end_pos = (1, 3); file = "test" } );
             `Scalar
               ( { value = "a . b"; style = `Single_quoted },
                 { start_pos = (1, 5); end_pos = (1, 12); file = "test" } );
             `Scalar
               ( { value = "1.4"; style = `Plain },
                 { start_pos = (1, 13); end_pos = (1, 16); file = "test" } );
           ])
  | Error err ->
      Format.printf "%a" Log.pp err;
      assert false

let%test_unit "parse error : malformed object" =
  let str = {|
a:
  -1
  b: 5
|} in
  let parsed_yaml = parse "test" str in
  match parsed_yaml with
  | Ok _ -> assert false
  | Error (err, _) ->
      [%test_eq: string] err.message
        "Impossible de déclarer un objet à cet endroit"

let%test_unit "parse error: not allowed char" =
  let str = "'" in
  let parsed_yaml = parse "test" str in
  match parsed_yaml with
  | Ok _ -> assert false
  | Error (err, _) ->
      [%test_eq: string] err.message
        "Fin de fichier inattendue : il manque un caractère"

(* assert false *)

let%test_unit "parse error: incomplete array" =
  let str = {|
    a: [a, b,c
    b:
  |} in
  let parsed_yaml = parse "test" str in
  match parsed_yaml with
  | Ok _ -> assert false
  | Error (err, _) ->
      [%test_eq: string] err.message "Le tableau n'est pas fermé"

let%test_unit "parse error: incomplete object" =
  let str = {|
    {a:, b}
  |} in
  let parsed_yaml = parse "test" str in
  match parsed_yaml with
  | Ok _ -> assert false
  | Error (err, _) ->
      [%test_eq: string] err.message "`:` non valide à cet endroit"

let%test_unit "parse error: incomplete object" =
  let str = {|
    - {a:4, b
    - 14
  |} in
  let parsed_yaml = parse "test" str in
  match parsed_yaml with
  | Ok _ -> assert false
  | Error (err, _) -> [%test_eq: string] err.message "L'objet n'est pas fermé"
