open Base
open Utils.Output
open Shared.Shared_ast
open Yaml_parser
open Parser_utils

let authorized_keys =
  Parse_meta.reserved_meta
  @ Hashtbl.keys Parse_mechanisms.chainable_mechanisms
  @ Hashtbl.keys Parse_mechanisms.value_mechanisms
  @ ["remplace"; "avec"; "rend non applicable"]
  (* To implement *)
  @ [ "barème"
    ; "grille"
    ; "inversion numérique"
    ; "moyenne"
    ; "est défini"
    ; "est applicable"
    ; "est non applicable"
    ; "est non défini"
    ; "taux progressif"
    ; "durée"
    ; "texte"
    ; "résoudre la référence circulaire"
    ; "une possibilité"
    ; "formule"
    ; "privé"
    ; "logarithme" ]

let rec parse_rule ~default_to_public ?(current_rule_name = []) (name, yaml) =
  let* name, pos = parse_ref name in
  let name = current_rule_name @ name in
  let* value = Parse_value.parse_value ~error_if_undefined:false ~pos yaml in
  let default_meta = if default_to_public then [Public] else [] in
  let parsed_rule =
    { name= Pos.mk ~pos (Shared.Rule_name.create_exn name)
    ; value
    ; meta= default_meta
    ; replace= []
    ; make_not_applicable= [] }
  in
  match yaml with
  | `Scalar _ ->
      return [parsed_rule]
  | `O yaml ->
      let* _ =
        Parser_utils.check_authorized_keys ~keys:authorized_keys
          ~hints:
            [ "Utilisez la clé 'meta' pour ajouter des propriétés \
               personnalisées à une règle" ]
          yaml
      in
      let* meta = Parse_meta.parse yaml in
      let meta = default_meta @ meta in
      let* with_ = parse_with ~default_to_public ~current_rule_name:name yaml in
      let* replace = parse_replace yaml in
      let* make_not_applicable = parse_make_not_applicable yaml in
      return
        ( { name= Pos.mk ~pos (Shared.Rule_name.create_exn name)
          ; value
          ; meta
          ; replace
          ; make_not_applicable }
        :: with_ )
  | `A _ ->
      (* Should not happen because already checked by parse_value*)
      empty

and parse_with ~default_to_public ?(current_rule_name = []) mapping =
  let rules = find_value "avec" mapping in
  match rules with
  | None ->
      return []
  | Some (rules, pos) ->
      parse_rules ~default_to_public ~pos ~current_rule_name rules

and parse_replace mapping =
  let replace = find_value "remplace" mapping in
  match replace with
  | None ->
      return []
  | Some (replace, pos) ->
      parse_one_or_many ~f:(Parse_replace.parse_replace ~pos) replace

and parse_make_not_applicable mapping =
  let make_not_applicable = find_value "rend non applicable" mapping in
  match make_not_applicable with
  | None ->
      return []
  | Some (make_not_applicable, pos) ->
      parse_one_or_many
        ~f:(Parse_replace.parse_make_not_applicable ~pos)
        make_not_applicable

and parse_rules ~default_to_public ~pos ?(current_rule_name = []) yaml =
  match yaml with
  | `O [] ->
      let code, message =
        if List.is_empty current_rule_name then Err.yaml_empty_file
        else Err.parsing_should_be_object
      in
      fatal_error ~code ~pos ~kind:`Syntax message
  | `O mapping ->
      let+ rules =
        List.map ~f:(parse_rule ~default_to_public ~current_rule_name) mapping
        |> all_keep_logs
      in
      List.concat rules
  | _ ->
      let code, message = Err.parsing_should_be_object in
      fatal_error ~pos ~code ~kind:`Syntax message

let parse ~filename ?(default_to_public = false) (yaml : yaml) : Ast.t Output.t
    =
  parse_rules ~default_to_public ~pos:(Pos.beginning_of_file filename) yaml
