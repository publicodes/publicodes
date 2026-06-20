open Base
open Shared
open Utils.Output
open Shared.Typ
open Yaml_parser

let parse_symbol ~pos yaml =
  match yaml with
  | `Scalar ({value; style= `Single_quoted}, pos) ->
      return (Pos.mk ~pos value)
  | _ ->
      let code, message = Err.invalid_symbol in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_possibility ~pos (mapping : Yaml_parser.mapping) =
  match Parser_utils.find_value "une possibilité" mapping with
  | Some (`A consts, pos) ->
      let* symbols = List.map consts ~f:(parse_symbol ~pos) |> all_keep_logs in
      return (Shared_ast.Type (Pos.mk ~pos (Enum symbols)))
  | Some _ ->
      let code, message = Err.parsing_should_be_array in
      fatal_error ~pos ~kind:`Syntax ~code message
  | None ->
      let code, message = Err.parsing_invalid_mechanism in
      fatal_error ~pos ~kind:`Syntax ~code message
        ~hints:["clef `une possibilité` attendue"]

let parse_type ~pos ~parse:_ value =
  match value with
  | `Scalar ({value= "texte"; _}, pos) ->
      return (Shared_ast.Type (Pos.mk ~pos (Literal String)))
  | `Scalar ({value= "booléen"; _}, pos) ->
      return (Shared_ast.Type (Pos.mk ~pos (Literal Bool)))
  | `Scalar ({value= "date"; _}, pos) ->
      return (Shared_ast.Type (Pos.mk ~pos (Literal Date)))
  | `Scalar ({value= "nombre"; _}, pos) ->
      return (Shared_ast.Type (Pos.mk ~pos (Number None)))
  | `Scalar ({value= ""; _}, pos) ->
      let code, message = Err.parsing_empty_value in
      fatal_error ~pos ~kind:`Syntax ~code message
  | `Scalar _ ->
      (* FIXME: should be an invalid_type error *)
      let code, message = Err.invalid_value in
      fatal_error ~pos ~kind:`Syntax ~code message
        ~labels:
          [ Pos.mk ~pos
              "Les types valides sont `texte`, `booléen`, `date` ou `nombre`."
          ]
  | `O mapping ->
      parse_possibility ~pos mapping
  | _ ->
      let code, message = Err.parsing_should_be_scalar in
      fatal_error ~pos ~kind:`Syntax ~code message
        ~hints:
          [ "Une chaine de caractères simple ou un objet est attendue, mais un \
             tableau a été trouvé."
          ; "Vérifiez l'indentation." ]

let parse_units ~pos ~parse:_ value =
  let* {value; _}, pos = Parser_utils.get_scalar ~pos value in
  match value with
  | "" ->
      return (Shared_ast.Type (Pos.mk ~pos (Number (Some Shared.Units.empty))))
  | _ -> (
      (* We create a fake number to parse the unit the same way we parse them in expression *)
      let units = Expr.parse_expression ~pos ("0 " ^ value) |> Output.result in
      match units with
      | Some (Shared_ast.Const (Shared_ast.Number (_, unit)), _) ->
          return (Shared_ast.Type (Pos.mk ~pos (Number unit)))
      | _ ->
          let code, message = Err.invalid_value in
          fatal_error ~pos ~kind:`Syntax ~code message
            ~labels:[Pos.mk ~pos "Unité non valide"] )
