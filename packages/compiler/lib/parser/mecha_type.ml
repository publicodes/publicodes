open Shared
open Utils.Output
open Shared.Shared_typ
open Yaml_parser

let parse_type ~pos ~parse:_ value =
  match value with
  | `A _ | `O _ ->
      let code, message = Err.parsing_should_be_scalar in
      fatal_error ~pos ~kind:`Syntax ~code message
  | `Scalar ({value; _}, pos) -> (
    match value with
    | "texte" ->
        return (Shared_ast.Type (Pos.mk ~pos (Literal String)))
    | "booléen" ->
        return (Shared_ast.Type (Pos.mk ~pos (Literal Bool)))
    | "date" ->
        return (Shared_ast.Type (Pos.mk ~pos (Literal Date)))
    | "nombre" ->
        return (Shared_ast.Type (Pos.mk ~pos (Number None)))
    | "" ->
        let code, message = Err.parsing_empty_value in
        fatal_error ~pos ~kind:`Syntax ~code message
    | _ ->
        let code, message = Err.invalid_value in
        fatal_error ~pos ~kind:`Syntax ~code message
          ~labels:
            [ Pos.mk ~pos
                "Les types valides sont `texte`, `booléen`, `date` ou `nombre`."
            ] )

let parse_units ~pos ~parse:_ value =
  match value with
  | `A _ | `O _ ->
      let code, message = Err.parsing_should_be_scalar in
      fatal_error ~pos ~kind:`Syntax ~code message
  | `Scalar ({value; _}, pos) -> (
    match value with
    | "" ->
        return (Shared_ast.Type (Pos.mk ~pos (Number (Some Shared.Units.empty))))
    | _ -> (
        (* We create a fake number to parse the unit the same way we parse them in expression *)
        let units =
          Expr.parse_expression ~pos ("0 " ^ value) |> Output.result
        in
        match units with
        | Some (Shared_ast.Const (Shared_ast.Number (_, unit)), _) ->
            return (Shared_ast.Type (Pos.mk ~pos (Number unit)))
        | _ ->
            let code, message = Err.invalid_value in
            fatal_error ~pos ~kind:`Syntax ~code message
              ~labels:[Pos.mk ~pos "Unité non valide"] ) )
