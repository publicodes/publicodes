open Yaml.Stream

let starts_with = String.starts_with

open Base
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
    , ("impossible de déclarer un objet à cet endroit", []) )
  ; ( "error calling parser: did not find expected ',' or ']'"
    , ( "le tableau n'est pas fermé"
      , ["il manque  `]` pour le fermer, ou `,` pour ajouter un élément"] ) )
  ; ( "error calling parser: did not find expected ',' or '}'"
    , ( "l'objet n'est pas fermé"
      , ["il manque  `}` pour le fermer, ou `,` pour ajouter un élément"] ) )
  ; ( "error calling parser: found unexpected end of stream character"
    , ( "fin de fichier inattendue (il manque un caractère)"
      , ["Par exemple, `\"`, `\'`, ou `]`"] ) )
  ; ( "error calling parser: found unexpected ':'"
    , ("caractère `:` non valide à cet endroit", []) ) ]

let make_scalar pos (scalar : Yaml.scalar) =
  Pos.mk ~pos Ast.{value= scalar.value; style= scalar.style}

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
    Pos.
      { file= filename
      ; start_pos=
          { index= start_mark.index
          ; line= start_mark.line + 1
          ; column= start_mark.column + 1 }
      ; end_pos=
          { index= end_mark.index
          ; line= end_mark.line + 1
          ; column= end_mark.column + 1 } }
  in
  let transform_error ?(pos = Pos.beginning_of_file filename) result =
    match result with
    | Ok result ->
        Output.return result
    | Error (`Msg err) ->
        let message, hints =
          List.find_map message_traduction ~f:(fun (prefix, value) ->
              if starts_with ~prefix err then Some value else None )
          |> Option.value ~default:(err, [])
        in
        fatal_error message ~pos ~kind:`Yaml ~code:Err.Code.Yaml_parsing ~hints
  in
  let* parser = Yaml.Stream.parser content |> transform_error in
  let* first_token = Yaml.Stream.do_parse parser |> transform_error in
  let current_token = ref first_token in
  (* Create an error message based on the position of the last parsed token *)
  let fatal_error_from_current_token (code, message) =
    let _, mark = !current_token in
    fatal_error ~pos:(pos_from_mark mark) ~kind:`Yaml message ~code
  in
  let unexpected_token_error token expected =
    fatal_error_from_current_token
    @@ Err.yaml_unexpected_token ~actual:(print_token token) ~expected
  in
  (* Advance to the next token *)
  let next () =
    let* token =
      Yaml.Stream.do_parse parser
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
        fatal_error_from_current_token Err.yaml_alias_not_supported
    | Event.Nothing ->
        fatal_error_from_current_token Err.yaml_empty_file
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
