open Base
open Shared
open Utils
include Tree

let from_typed_ast ~(replacement_graph : Replacement_graph.Rule_graph.t)
  ~(make_not_applicable_graph : Replacement_graph.Rule_graph.t)
  (ast :
  Shared_ast.typed) :
    Typ.t option Tree.t Output.t =
  let eval_tree =
    Hashtbl.create
      (module Shared.Rule_name)
      ~size:(List.length ast) ~growth_allowed:false
  in
  let logs =
    List.fold ast ~init:[]
      ~f:(fun acc_logs Shared_ast.{name; value; _} ->
        let rule_name = Mark.remove name in
        let value =
          Transform_value.transform ~undefined:(Get_context rule_name) value
        in
        (** NOTE: logs gestions could it be smarter? *)
        let logs =
            let value, logs =
              Replacements.transform ~replacement_graph ~make_not_applicable_graph rule_name value
            in
            let _ =
              match value with
              | Some data ->
                  ignore (Hashtbl.add eval_tree ~key:rule_name ~data)
              | None ->
                  ()
            in
            logs
        in
        logs @ acc_logs )
  in
  Output.return ~logs eval_tree

let _type_check a = Output.return a
