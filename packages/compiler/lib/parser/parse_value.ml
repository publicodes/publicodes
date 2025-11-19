open Shared.Shared_ast
open Yaml_parser
open Utils
open Utils.Output
open Parser_utils
open Expr

(* Parse a value (mechanisms or scalar) *)
let rec parse_value ?(error_if_undefined = true) ~pos (yaml : yaml) :
    Ast.value Output.t =
  match yaml with
  | `Scalar ({value= ""; _}, value_pos) ->
      let logs =
        if error_if_undefined then
          let code, message = Err.parsing_empty_value in
          [ Log.error ~pos ~code ~kind:`Syntax message
              ~labels:[Pos.mk ~pos:value_pos "valeur attendue ici"] ]
        else []
      in
      return ~logs {value= Pos.mk ~pos Undefined; chainable_mechanisms= []}
  | `Scalar ({value; style= `Single_quoted}, value_pos)
  | `Scalar ({value; style= `Double_quoted}, value_pos) ->
      return
        { value=
            Pos.mk ~pos (Expr (Pos.mk ~pos:value_pos (Const (String value))))
        ; chainable_mechanisms= [] }
  | `Scalar ({value; _}, pos) ->
      let* expr = parse_expression ~pos value in
      return {value= Pos.mk ~pos (Expr expr); chainable_mechanisms= []}
  | `O mapping ->
      let* mapping = remove_double mapping in
      let* value =
        Parse_mechanisms.parse_value_mechanism ~pos ~parse:parse_value mapping
      in
      let* chainable_mechanisms =
        Parse_mechanisms.parse_chainable_mechanisms ~parse:parse_value mapping
      in
      let logs =
        match (error_if_undefined, value) with
        | true, (Undefined, pos) ->
            let code, message = Err.parsing_empty_value in
            [ Log.error ~pos ~code ~kind:`Syntax message
                ~hints:
                  [ "Ajoutez un mechanisme de valeur, comme par exemple : « \
                     valeur », « somme » ou « une de ces conditions »." ] ]
        | _ ->
            []
      in
      return ~logs {value; chainable_mechanisms}
  | `A _ ->
      let logs =
        let code, message = Err.parsing_should_be_array in
        [ Log.error ~pos ~code ~kind:`Syntax message
            ~hints:
              [ "Peut-être avez-vous oublié d'ajouter le nom du mécanisme (par \
                 exemple « somme : »)" ] ]
      in
      return ~logs {value= Pos.mk ~pos Undefined; chainable_mechanisms= []}
