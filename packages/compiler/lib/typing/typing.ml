open Shared
open Utils
open Output

let type_check ~replacement_graph (resolved : Shared_ast.resolved) :
    Shared_ast.typed Utils.Output.t =
  let ast = From_resolved.from_resolved resolved in
  let* _ = Type_check.type_check ast ~replacement_graph in
  To_typed.to_typed ast
