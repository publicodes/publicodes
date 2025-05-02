open Yaml.Stream

let starts_with = String.starts_with

open Core
open Ast
open Utils

(*
This module will parse YAML content and produce YAML AST with position information.

We are parsing the following grammar:
  stream ::= STREAM-START document* STREAM-END
  document ::= DOCUMENT-START node DOCUMENT-END
  node ::= ALIAS | SCALAR | sequence | mapping
  sequence ::= SEQUENCE-START node* SEQUENCE-END
  mapping ::= MAPPING-START (node node)* MAPPING-END

Cf https://ocaml.org/p/yaml/3.2.0/doc/Yaml/Stream/Event/index.html
*)

(* Better error message *)
let message_traduction =
  [ ( "error calling parser: mapping values are not allowed in this context"
    , ("Impossible de déclarer un objet à cet endroit", None) )
  ; ( "error calling parser: did not find expected ',' or ']'"
    , ( "Le tableau n'est pas fermé"
      , Some "il manque  `]` pour le fermer, ou `,` pour ajouter un élément" )
    )
  ; ( "error calling parser: did not find expected ',' or '}'"
    , ( "L'objet n'est pas fermé"
      , Some "il manque  `}` pour le fermer, ou `,` pour ajouter un élément" )
    )
  ; ( "error calling parser: found unexpected end of stream character"
    , ( "Fin de fichier inattendue : il manque un caractère"
      , Some "Par exemple, `\"`, `\'`, ou `]`" ) )
  ; ( "error calling parser: found unexpected ':'"
    , ("`:` non valide à cet endroit", None) ) ]

let make_scalar pos (scalar : Yaml.scalar) =
  With_pos.mk pos Ast.{value= scalar.value; style= scalar.style}

let print_token =
  let open Event in
  function
  | Alias _ ->
      "Alias"
  | Scalar _ ->
      "Scalar"
  | Stream_start _ ->
      "Stream_start"
  | Document_start _ ->
      "Document_start"
  | Document_end _ ->
      "Document_end"
  | Mapping_start _ ->
      "Mapping_start"
  | Mapping_end ->
      "Mapping_end"
  | Stream_end ->
      "Stream_end"
  | Sequence_start _ ->
      "Sequence_start"
  | Sequence_end ->
      "Sequence_end"
  | Nothing ->
      "Nothing"

let parse (filename : string) (content : string) : yaml Output.t =
  let open Output in
  (* Create a parser from the content *)
  let pos_from_mark Event.{start_mark; end_mark} =
    With_pos.
      { file= filename
      ; start_pos= (start_mark.line + 1, start_mark.column + 1)
      ; end_pos= (end_mark.line + 1, end_mark.column + 1) }
  in
  let transform_error ?(pos = With_pos.beginning_of_file filename) result =
    match result with
    | Ok result ->
        Output.return result
    | Error (`Msg err) ->
        let message, hint =
          List.find_map message_traduction ~f:(fun (prefix, value) ->
              if starts_with ~prefix err then Some value else None )
          |> Option.value ~default:(err, None)
        in
        fatal_error ~pos ~kind:`Yaml ?hint message
  in
  let* parser = parser content |> transform_error in
  let* first_token = do_parse parser |> transform_error in
  let current_token = ref first_token in
  (* Create an error message based on the position of the last parsed token *)
  let error message =
    let _, mark = !current_token in
    fatal_error ~pos:(pos_from_mark mark) ~kind:`Yaml message
  in
  let unexpected_token_error token expected =
    let message =
      Format.sprintf "[Internal error] Unexpected token : %s. Was expecting %s."
        (print_token token) expected
    in
    error message
  in
  (* Advance to the next token *)
  let next () =
    let* token =
      do_parse parser
      |> transform_error ~pos:(pos_from_mark (snd !current_token))
    in
    current_token := token ;
    return token
  in
  let rec parse_stream () =
    let stream_start, _ = !current_token in
    match stream_start with
    | Event.Stream_start _ -> (
        let* result = parse_document () in
        let* stream_end, _ = next () in
        match stream_end with
        | Event.Stream_end ->
            return result
        | token ->
            unexpected_token_error token "the end of stream" )
    | token ->
        unexpected_token_error token "the beginning of stream"
  and parse_document () =
    let* document_start, _ = next () in
    match document_start with
    | Event.Document_start _ -> (
        let* _ = next () in
        let* result = parse_node () in
        let* document_end, _ = next () in
        match document_end with
        | Event.Document_end _ ->
            return result
        | token ->
            unexpected_token_error token "the end of file" )
    | token ->
        unexpected_token_error token "the beginning of file"
  and parse_node () =
    let event, pos = !current_token in
    match event with
    | Event.Scalar scalar ->
        let pos = pos_from_mark pos in
        return (`Scalar (make_scalar pos scalar))
    | Event.Sequence_start _ ->
        parse_sequence []
    | Event.Mapping_start _ ->
        parse_mapping []
    | Event.Alias _ ->
        error "Il n'est pas possible d'utiliser un alias avec Publicodes"
    | Event.Nothing ->
        error "Le fichier est vide"
    | _ ->
        failwith "Internal error"
  and parse_sequence (seq : sequence) =
    let* event = next () in
    match event with
    | Event.Sequence_end, _ ->
        return (`A (List.rev seq))
    | _ ->
        let* node = parse_node () in
        parse_sequence (node :: seq)
  and parse_mapping (mapping : mapping) =
    let* event, _ = next () in
    match event with
    | Event.Mapping_end ->
        return (`O (List.rev mapping))
    | _ ->
        let* key = parse_key () in
        let* _ = next () in
        let* value = parse_node () in
        parse_mapping ((key, value) :: mapping)
  and parse_key () =
    let event, pos = !current_token in
    match event with
    | Event.Scalar scalar ->
        let pos = pos_from_mark pos in
        return (make_scalar pos scalar)
    | token ->
        unexpected_token_error token "une chaine de caractères"
  in
  parse_stream ()
