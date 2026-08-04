open Shared
open Utils
open Output

(** Type-checks the resolved AST, inferring and annotating types on every
    expression node. Returns a typed AST. *)
let type_check ~replaces (resolved : Shared_ast.resolved) :
    Shared_ast.typed Utils.Output.t =
  let ast = From_resolved.from_resolved resolved in
  let* _ = Type_check.type_check ~replaces ast in
  To_typed.to_typed ast
