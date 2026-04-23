open Utils
open Utils.Output

type target_type = Js | Debug_eval_tree | Json_doc

let to_eval_tree ~ast =
  let* ast = Resolver.to_resolved_ast ast in
  let eval_tree = Typed_tree.from_resolved_ast ast in
  let* replacements = Replacements.from_resolved_ast ast in
  let* eval_tree_with_replacements =
    Replacements.apply_replacements ~mk:Typed_tree.mk ~replacements eval_tree
  in
  let+ typed_tree = Typed_tree.type_check eval_tree_with_replacements in
  Hashed_tree.from_typed_tree typed_tree

let compile ~input_files ~output_type ~default_to_public =
  let open Output in
  let* ast = Parser.parse_files ~default_to_public input_files in
  let* eval_tree = to_eval_tree ~ast in
  let* outputs =
    Dependency_graph.cycle_check eval_tree
    >>= Dependency_graph.extract_outputs ~ast ~eval_tree
          ~warn_types:(not default_to_public)
  in
  let output_str =
    match output_type with
    | Debug_eval_tree ->
        Hashed_tree.to_debug_str eval_tree outputs
    | Js ->
        Hashed_tree.to_js_str eval_tree outputs
    | Json_doc ->
        Hashed_tree.to_json_doc_str eval_tree
  in
  return output_str
