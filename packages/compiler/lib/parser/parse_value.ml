open Shared.Shared_ast
open Yaml_parser
open Utils
open Utils.Output
open Parser_utils
open Expr

(* Parse a value (mechanisms or scalar) *)

(** FIXME: should handle creating value with dummy mark *)
let rec parse_value ?(error_if_undefined = true) ~pos (yaml : yaml) :
    Ast.value Output.t =
  match yaml with
  | `Scalar ({value; style}, {pos= value_pos}) -> (
    match style with
    | `Single_quoted ->
        return
          (Mark.mk_pos ~pos
             { value=
                 Mark.mk_pos ~pos
                   (Expr (Mark.mk_pos ~pos:value_pos (Const (Symbol value))))
             ; chainable_mechanisms= [] } )
    | `Double_quoted ->
        return
          (Mark.mk_pos ~pos
             { value=
                 Mark.mk_pos ~pos
                   (Expr (Mark.mk_pos ~pos:value_pos (Const (String value))))
             ; chainable_mechanisms= [] } )
    | _ when String.equal value "" ->
        let logs =
          if error_if_undefined then
            let code, message = Err.parsing_empty_value in
            [ Log.error ~pos ~code ~kind:`Syntax message
                ~labels:[Mark.mk_pos ~pos:value_pos "valeur attendue ici"] ]
          else []
        in
        return ~logs
          (Mark.mk_pos ~pos
             {value= Mark.mk_pos ~pos Not_defined; chainable_mechanisms= []} )
    | _ ->
        let* expr = parse_expression ~pos:value_pos value in
        return
          (Mark.mk_pos ~pos
             {value= Mark.mk_pos ~pos (Expr expr); chainable_mechanisms= []} ) )
  | `O mapping ->
      let* mapping = remove_double mapping in
      let* value =
        (* NOTE: pourquoi avoir la fonction parse comme arguement si c'est
				 toujours la même ? *)
        Parse_mechanisms.parse_value_mechanism ~pos ~parse:parse_value mapping
      in
      let* chainable_mechanisms =
        Parse_mechanisms.parse_chainable_mechanisms ~parse:parse_value mapping
      in
      let logs =
        match (error_if_undefined, value) with
        | true, (Not_defined, {pos}) ->
            let code, message = Err.parsing_empty_value in
            [ Log.error ~pos ~code ~kind:`Syntax message
                ~hints:
                  [ "Ajoutez un mechanisme de valeur, comme par exemple : « \
                     valeur », « somme » ou « une de ces conditions »." ] ]
        | _ ->
            []
      in
      return ~logs (Mark.mk_pos ~pos {value; chainable_mechanisms})
  | `A _ ->
      let logs =
        let code, message = Err.parsing_should_be_array in
        [ Log.error ~pos ~code ~kind:`Syntax message
            ~hints:
              [ "Peut-être avez-vous oublié d'ajouter le nom du mécanisme (par \
                 exemple « somme : »)" ] ]
      in
      return ~logs
        (Mark.mk_pos ~pos
           {value= Mark.mk_pos ~pos Not_defined; chainable_mechanisms= []} )
