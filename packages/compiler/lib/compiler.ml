open Utils

type t =
  { input_files: string list
  ; module_path: string
  ; output_type: target_type
  ; default_to_public: bool }

and target_type = Js | Debug_eval_tree | Json_doc

let compile {input_files; module_path; output_type; default_to_public} =
  let open Output in
  let* surface_ast =
    Parser.parse_files input_files ~default_to_public ~module_path
  in
  let* resolved_ast = Resolver.from_surface_ast surface_ast in
  let* {replacement_graph; make_not_applicable_graph; dependency_graph} =
    Analysis.mk_and_checks resolved_ast
  in
  let* typed_ast = Typing.type_check resolved_ast ~replacement_graph in
  let* outputs =
    Analysis.extract_outputs dependency_graph ~ast:typed_ast
      ~warn_types:(not default_to_public)
  in
  let eval_tree =
    Eval_tree.from_typed_ast typed_ast ~replacement_graph
      ~make_not_applicable_graph
  in
  let output_str =
    match output_type with
    | Json_doc ->
        Shared.To_json_doc.to_str resolved_ast
    | Debug_eval_tree ->
        Backends.to_debug eval_tree outputs
    | Js ->
        Backends.to_js eval_tree outputs
  in
  return output_str
