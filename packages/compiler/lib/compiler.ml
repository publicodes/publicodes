open Utils

type t =
  { input_files: string list
  ; module_path: string
  ; output_type: target_type
  ; default_to_public: bool }

and target_type = Js | Debug_eval_tree | Json_doc

let compile {input_files; module_path; output_type; default_to_public} =
  let open Output in
  let* ast = Parser.parse_files ~default_to_public ~module_path input_files in
  let* resolved_ast = Resolver.to_resolved_ast ast in
  let* replacement_graph, make_not_applicable_graph =
    Replacement_graph.mk_and_checks resolved_ast
  in
  let* dependency_graph = Dependency_graph.mk_and_checks resolved_ast in
  let* typed_ast = Typing.type_check ~replaces:replacement_graph resolved_ast in
  let* eval_tree =
    Eval_tree.from_typed_ast ~replacement_graph ~make_not_applicable_graph
      typed_ast
  in
  let hashed_tree = Hashed_tree.from_typed_tree eval_tree in
  let* outputs =
    Dependency_graph.extract_outputs dependency_graph ~ast:resolved_ast
      ~eval_tree:hashed_tree ~warn_types:(not default_to_public)
  in
  let output_str =
    match output_type with
    | Debug_eval_tree ->
        Hashed_tree.to_debug_str hashed_tree outputs
    | Js ->
        Hashed_tree.to_js_str hashed_tree outputs
    | Json_doc ->
        Shared.To_json_doc.to_str resolved_ast
  in
  return output_str
