open Shared
open Utils
open Output.Let_syntax

(** [type_check ~replaces resolved] infers a typed AST from [resolved] with
    possible type errors. *)
let type_check ~replaces (resolved : Shared_ast.resolved) :
    Shared_ast.typed Utils.Output.t =
  let ast = From_resolved.from_resolved resolved in
  let* _ = Type_check.type_check ~replaces ast in
  To_typed.to_typed ast
