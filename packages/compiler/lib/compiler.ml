open Utils

type t =
  { input_files: string list
  ; module_path: string
  ; output_type: target_type
  ; default_to_public: bool }

and target_type = Js | Json | Debug_eval_tree

let compile {input_files; module_path; output_type; default_to_public} =
  let open Output in
  let* ast = Parser.parse_files ~default_to_public ~module_path input_files in
  let* resolved_ast = Resolver.to_resolved_ast ast in
  let* dependency_graph = Dependency_graph.mk_and_checks resolved_ast in
  let untyped_eval_tree = Typed_tree.from_resolved_ast resolved_ast in
  let* replacements = Replacements.from_resolved_ast resolved_ast in
  let* eval_tree_with_replacements =
    Replacements.apply_replacements ~mk:Typed_tree.mk ~replacements
      untyped_eval_tree
  in
  let* typed_ast = Typed_tree.type_check eval_tree_with_replacements in
  let typed_hashed_ast = Hashed_tree.from_typed_tree typed_ast in
  let* outputs =
    Dependency_graph.extract_outputs dependency_graph ~ast:resolved_ast
      ~eval_tree:typed_hashed_ast ~warn_types:(not default_to_public)
  in
  let output_str =
    match output_type with
    | Js ->
        Hashed_tree.to_js_str typed_hashed_ast outputs
    | Json ->
        Autodoc.to_json_str resolved_ast typed_ast
    | Debug_eval_tree ->
        Hashed_tree.to_debug_str typed_hashed_ast outputs
  in
  return output_str
