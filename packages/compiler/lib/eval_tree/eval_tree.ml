open Base
open Shared
open Utils
include Tree

let from_typed_ast ~(replacement_graph : Replacement_graph.Rule_graph.t)
    ~(make_not_applicable_graph : Replacement_graph.Rule_graph.t)
    (ast : Shared_ast.typed) : Typ.t option Tree.t =
  let eval_tree =
    Hashtbl.create
      (module Shared.Rule_name)
      ~size:(List.length ast) ~growth_allowed:false
  in
  List.fold ast ~init:eval_tree ~f:(fun eval_tree Shared_ast.{name; value; _} ->
      let rule_name = Mark.remove name in
      let value =
        Transform_value.transform ~undefined:(Get_context rule_name) value
      in
      let value =
        Replacements.transform ~replacement_graph ~make_not_applicable_graph
          rule_name value
      in
      let _ = Hashtbl.add eval_tree ~key:rule_name ~data:value in
      eval_tree )
