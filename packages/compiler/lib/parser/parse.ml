open Base
open Utils.Output
open Shared.Shared_ast
open Yaml_parser
open Parser_utils

let authorized_keys =
  Parse_meta.reserved_meta
  @ Hashtbl.keys Parse_mechanisms.chainable_mechanisms
  @ Hashtbl.keys Parse_mechanisms.value_mechanisms
  @ ["remplace"; "avec"; "rend non applicable"; "importer"]
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

type context = {current_rule_name: string list; files: string list}

let rec parse_rule ~default_to_public ~ctx (name, yaml) =
  let* name, pos = parse_ref name in
  let name = ctx.current_rule_name @ name in
  let* value = Parse_value.parse_value ~error_if_undefined:false ~pos yaml in
  let default_meta = if default_to_public then [Public] else [] in
  let meta =
    if List.length ctx.files = 1 then default_meta
    else List.filter default_meta ~f:(function Public -> false | _ -> true)
  in
  let parsed_rule =
    { name= Pos.mk ~pos (Shared.Rule_name.create_exn name)
    ; value
    ; meta
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
      let meta =
        if List.length ctx.files = 1 then meta
        else List.filter meta ~f:(function Public -> false | _ -> true)
      in
      let* with_ =
        parse_with ~default_to_public
          ~ctx:{ctx with current_rule_name= name}
          yaml
      in
      let* import =
        parse_import ~default_to_public
          ~ctx:{ctx with current_rule_name= name}
          yaml
      in
      let* replace = parse_replace yaml in
      let* make_not_applicable = parse_make_not_applicable yaml in
      return
        ( [ { name= Pos.mk ~pos (Shared.Rule_name.create_exn name)
            ; value
            ; meta
            ; replace
            ; make_not_applicable } ]
        @ with_ @ import )
  | `A _ ->
      (* Should not happen because already checked by parse_value*)
      empty

and parse_with ~default_to_public ~ctx mapping =
  let rules = find_value "avec" mapping in
  match rules with
  | None ->
      return []
  | Some (rules, pos) ->
      parse_rules ~default_to_public ~pos ~ctx rules

and parse_import ~default_to_public ~ctx mapping =
  let import = find_value "importer" mapping in
  match import with
  | None ->
      return []
  | Some (import, pos) -> (
    match import with
    | `A yaml -> (
        let* values = yaml |> List.map ~f:(get_scalar ~pos) |> all_keep_logs in
        let input_files =
          List.map ~f:(fun ({value; _}, pos) -> (value, pos)) values
        in
        let circular =
          List.find input_files ~f:(fun (filename, _) ->
              List.exists ctx.files ~f:(fun file -> String.equal file filename) )
        in
        match circular with
        | Some (circular, pos) ->
            let code, message = Err.import_cycle (circular :: ctx.files) in
            fatal_error ~pos ~code ~kind:`Syntax message
        | None ->
            let input_files =
              List.map ~f:(fun (value, _) -> value) input_files
            in
            parse_files ~default_to_public ~ctx input_files )
    | _ ->
        let code, message = Err.parsing_should_be_array in
        fatal_error ~pos ~code ~kind:`Syntax message )

and parse_files ~default_to_public ~ctx input_files =
  let+ unresolved_programs =
    List.map input_files ~f:(fun filename ->
        (* Read the file content *)
        let file_content = File.read_file filename in
        (* Parse the file content *)
        to_yaml ~filename file_content
        >>= parse_rules ~default_to_public
              ~pos:(Pos.beginning_of_file filename)
              ~ctx:{ctx with files= filename :: ctx.files} )
    |> all_keep_logs
  in
  List.fold
    ~f:(fun acc program -> Ast.merge acc program)
    ~init:[] unresolved_programs

and parse_root ~default_to_public input_files =
  let ctx = {current_rule_name= []; files= []} in
  parse_files ~default_to_public ~ctx input_files

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

and parse_rules ~default_to_public ~pos ~ctx yaml =
  match yaml with
  | `O [] ->
      let code, message =
        if List.is_empty ctx.current_rule_name then Err.yaml_empty_file
        else Err.parsing_should_be_object
      in
      fatal_error ~code ~pos ~kind:`Syntax message
  | `O mapping ->
      let+ rules =
        List.map ~f:(parse_rule ~default_to_public ~ctx) mapping
        |> all_keep_logs
      in
      List.concat rules
  | _ ->
      let code, message = Err.parsing_should_be_object in
      fatal_error ~pos ~code ~kind:`Syntax message

let parse ~filename ?(default_to_public = false) (yaml : yaml) : Ast.t Output.t
    =
  let ctx = {current_rule_name= []; files= [filename]} in
  parse_rules ~default_to_public ~pos:(Pos.beginning_of_file filename) ~ctx yaml
