open Base
open Shared
open Utils
include Tree
module Type = Type

let from_resolved_ast (resolved_ast : Shared.Shared_ast.resolved) :
    Type.t Tree.t Output.t =
  let eval_tree =
    Hashtbl.create
      (module Shared.Rule_name)
      ~size:(List.length resolved_ast) ~growth_allowed:false
  in
  let replacements, logs = Replacements.from_resolved_ast resolved_ast in
  let logs =
    List.fold resolved_ast ~init:logs
      ~f:(fun acc_logs Shared_ast.{name; value; _} ->
        let rule_name = Pos.value name in
        let value =
          Transform_value.transform ~undefined:(Get_context rule_name) value
        in
        (** NOTE: logs gestions could it be smarter? *)
        let logs =
          match replacements with
          | None ->
              []
          | Some replacements ->
              let value, logs =
                Replacements.transform ~replacements rule_name value
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

let type_check a = Output.return a
