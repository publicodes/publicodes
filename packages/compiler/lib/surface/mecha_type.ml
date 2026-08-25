open Base
open Shared
open Utils.Output
open Shared.Typ
open Yaml_parser

let parse_symbol ~pos yaml =
  match yaml with
  | `Scalar scalar ->
      let pos = Mark.pos scalar in
      let {value; style} = Mark.remove scalar in
      if Poly.( = ) style `Single_quoted then
        return (Mark.mk_pos ~pos (LSymbol value))
      else
        let code, message = Err.invalid_symbol in
        fatal_error ~pos ~kind:`Syntax ~code message
  | _ ->
      let code, message = Err.invalid_symbol in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_possibility ~pos (mapping : Yaml_parser.mapping) =
  match Parser_utils.find_value "une possibilité" mapping with
  | Some value -> (
      let pos = Mark.pos value in
      match Mark.remove value with
      | `A consts ->
          let* symbols =
            List.map consts ~f:(parse_symbol ~pos) |> all_keep_logs
          in
          return (Shared_ast.Type (Mark.mk_pos ~pos (TEnum symbols)))
      | _ ->
          let code, message = Err.parsing_should_be_array in
          fatal_error ~pos ~kind:`Syntax ~code message )
  | None ->
      let code, message = Err.parsing_invalid_mechanism in
      fatal_error ~pos ~kind:`Syntax ~code message
        ~hints:["clef `une possibilité` attendue"]

let parse_type ~pos ~parse:_ value =
  match value with
  | `Scalar scalar -> (
      let pos = Mark.pos scalar in
      match Yaml_parser.get_value scalar with
      | "texte" ->
          return (Shared_ast.Type (Mark.mk_pos ~pos TString))
      | "booléen" ->
          return (Shared_ast.Type (Mark.mk_pos ~pos TBool))
      | "date" ->
          return (Shared_ast.Type (Mark.mk_pos ~pos TDate))
      | "nombre" ->
          return (Shared_ast.Type (Mark.mk_pos ~pos (TNumber None)))
      | "" ->
          let code, message = Err.parsing_empty_value in
          fatal_error ~pos ~kind:`Syntax ~code message
      | _ ->
          (* FIXME: should be an invalid_type error *)
          let code, message = Err.invalid_value in
          fatal_error ~pos ~kind:`Syntax ~code message
            ~labels:
              [ Mark.mk_pos ~pos
                  "Les types valides sont `texte`, `booléen`, `date` ou \
                   `nombre`." ] )
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
  let* scalar = Parser_utils.get_scalar ~pos value in
  let value = Yaml_parser.get_value scalar in
  let pos = Mark.pos scalar in
  match value with
  | "" ->
      return
        (Shared_ast.Type (Mark.mk_pos ~pos (TNumber (Some Shared.Units.empty))))
  | _ -> (
      (* We create a fake number to parse the unit the same way we parse them in expression *)
      let units = Expr.parse_expression ~pos ("0 " ^ value) |> Output.result in
      match units with
      | Some expr -> (
        match Mark.remove expr with
        | Shared_ast.Const (Shared_ast.Number (_, unit)) ->
            return (Shared_ast.Type (Mark.mk_pos ~pos (TNumber unit)))
        | _ ->
            let code, message = Err.invalid_value in
            fatal_error ~pos ~kind:`Syntax ~code message
              ~labels:[Mark.mk_pos ~pos "Unité non valide"] )
      | _ ->
          let code, message = Err.invalid_value in
          fatal_error ~pos ~kind:`Syntax ~code message
            ~labels:[Mark.mk_pos ~pos "Unité non valide"] )
