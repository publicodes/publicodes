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

type context =
  { current_rule_name: string list (* the rule name currently parsed *)
  ; files: string list (* list of parsed files paths to detect cycles *)
  ; current_module_id: Shared.Module_id.t (* the module id genealogy *)
  ; next_module_id: int ref (* the next module id to be assigned *)
  ; current_package: string option (* the current package path *)
  ; current_module: string (* the current module path *) }

let rec parse_rule ~default_to_public ~ctx (name, yaml) =
  let* name, pos = parse_ref name in
  let name = ctx.current_rule_name @ name in
  let* value = Parse_value.parse_value ~error_if_undefined:false ~pos yaml in
  let default_meta = if default_to_public then [Public] else [] in
  let module_id = Module_id ctx.current_module_id in
  let parsed_rule =
    { name= Pos.mk ~pos (Shared.Rule_name.create_exn name)
    ; value
    ; meta= module_id :: default_meta
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
            ; meta= module_id :: meta
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
  let check_valid ~allow_relative path pos =
    if not (Utils.File.is_valid ~allow_relative path) then
      let code, message = Err.invalid_path in
      fatal_error ~pos ~code ~kind:`Syntax message
    else return path
  in
  match find_value "importer" mapping with
  | None ->
      return []
  | Some (import, pos) -> (
      let* package, (module_, pos) =
        match import with
        | `A _ ->
            let code, message = Err.parsing_should_not_be_array in
            fatal_error ~pos ~code ~kind:`Syntax message
        | `Scalar ({value; _}, pos) ->
            let* path = check_valid ~allow_relative:true value pos in
            let path = Utils.File.relativize_exn ctx.current_module path in
            return (ctx.current_package, (path, pos))
        | `O mapping -> (
            let* module_ =
              let code, message = Err.parsing_missing_value "module" in
              let log = Log.error ~pos ~code ~kind:`Syntax message in
              let* value, _ = find_value "module" mapping |> of_opt ~log in
              let* {value; _}, pos = get_scalar ~pos value in
              let* path = check_valid ~allow_relative:true value pos in
              let path = Utils.File.relativize_exn ctx.current_module path in
              return (path, pos)
            in
            match find_value "package" mapping with
            | None ->
                return (ctx.current_package, module_)
            | Some (package, pos) -> (
                let* {value; _}, pos = get_scalar ~pos package in
                let* path = check_valid ~allow_relative:false value pos in
                match
                  Utils.File.publicodes_package ctx.current_package path
                with
                | None ->
                    let code, message = Err.no_file_or_directory in
                    fatal_error ~pos ~code ~kind:`Syntax message
                | Some package ->
                    return (Some package, module_) ) )
      in
      let* input_files =
        match Utils.File.publicodes_module ?package module_ with
        | None ->
            let code, message = Err.no_file_or_directory in
            fatal_error ~pos ~code ~kind:`Syntax message
        | Some files ->
            return files
      in
      let circular_files =
        List.find input_files ~f:(fun filename ->
            List.exists ctx.files ~f:(String.equal filename) )
      in
      match circular_files with
      | Some circular ->
          let code, message = Err.import_cycle (circular :: ctx.files) in
          fatal_error ~pos ~code ~kind:`Syntax message
      | None ->
          let input_files = List.map ~f:(fun value -> value) input_files in
          parse_files ~default_to_public
            ~ctx:{ctx with current_package= package; current_module= module_}
            input_files )

and parse_files ~default_to_public ~ctx input_files =
  let module_id = !(ctx.next_module_id) in
  ctx.next_module_id := !(ctx.next_module_id) + 1 ;
  let+ unresolved_programs =
    List.map input_files ~f:(fun filename ->
        (* Read the file content *)
        let file_content = File.read_file filename in
        (* Parse the file content *)
        to_yaml ~filename file_content
        >>= parse_rules ~default_to_public
              ~pos:(Pos.beginning_of_file filename)
              ~ctx:
                { ctx with
                  files= filename :: ctx.files
                ; current_module_id=
                    Shared.Module_id.append ctx.current_module_id module_id } )
    |> all_keep_logs
  in
  List.fold
    ~f:(fun acc program -> Ast.merge acc program)
    ~init:[] unresolved_programs

and parse_root ~default_to_public ~module_ input_files =
  let ctx =
    { current_rule_name= []
    ; files= []
    ; current_module_id= Shared.Module_id.empty
    ; next_module_id= ref 0
    ; current_package= None
    ; current_module= module_ }
  in
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
  let ctx =
    { current_rule_name= []
    ; files= [filename]
    ; current_module_id= Shared.Module_id.empty
    ; next_module_id= ref 0
    ; current_package= None
    ; current_module= "" }
  in
  parse_rules ~default_to_public ~pos:(Pos.beginning_of_file filename) ~ctx yaml
