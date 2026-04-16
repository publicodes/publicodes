open Base
open Utils
open Utils.Output

type target_type = Js | Debug_eval_tree | Yaml

let to_unresolved_ast ~input_files ~default_to_public =
  let+ unresolved_programs =
    List.map input_files ~f:(fun filename ->
        (* Read the file content *)
        let file_content = File.read_file filename in
        (* Parse the file content *)
        Yaml_parser.to_yaml ~filename file_content
        >>= Parser.to_ast ~filename ~default_to_public )
    |> all_keep_logs
  in
  List.fold
    ~f:(fun acc program -> Parser.Ast.merge acc program)
    ~init:[] unresolved_programs

let to_eval_tree ~ast =
  let* ast = Resolver.to_resolved_ast ast in
  let eval_tree = Typed_tree.from_resolved_ast ast in
  let* replacements = Replacements.from_resolved_ast ast in
  let* eval_tree_with_replacements =
    Replacements.apply_replacements ~mk:Typed_tree.mk ~replacements eval_tree
  in
  let+ typed_tree = Typed_tree.type_check eval_tree_with_replacements in
  Hashed_tree.from_typed_tree typed_tree

let compile ~input_files ~output_type ~default_to_public : string Output.t =
  let open Output in
  let* ast = to_unresolved_ast ~input_files ~default_to_public in
  let* eval_tree = to_eval_tree ~ast in
  let* outputs =
    Dependency_graph.cycle_check eval_tree
    >>= Dependency_graph.extract_outputs ~ast ~eval_tree
  in
  let models = Hashed_tree.to_jingoo_models eval_tree outputs in
  match output_type with
  | Debug_eval_tree ->
      return @@ Utils.Template.from_template Eval_tree_template.template models
  | Js ->
      return @@ Utils.Template.from_template Js_template.template models
  | Yaml ->
      return @@ To_yaml.to_string eval_tree
