open Utils
open Output.Let_syntax

type target_type = Js | Json | Debug_eval_tree

type t =
  { input_files: File.t list
  ; module_path: File.t
  ; output_type: target_type
  ; default_to_public: bool
  ; without_trace: bool }

let compile
    {input_files; module_path; output_type; default_to_public; without_trace} =
  let* ast = Parser.parse_files ~default_to_public ~module_path input_files in
  let* resolved_ast = Resolver.from_parsed_ast ast in
  let* {replacement_graph; make_not_applicable_graph; dependency_graph} =
    Analysis.mk_and_checks resolved_ast
  in
  let* typed_ast = Typing.type_check resolved_ast replacement_graph in
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
    | Js ->
        Backends.to_js eval_tree outputs ~without_trace
    | Debug_eval_tree ->
        Backends.to_debug eval_tree outputs
    | Json ->
        Autodoc.to_json_str ~replacement_graph ~make_not_applicable_graph
          typed_ast
  in
  Output.return output_str
