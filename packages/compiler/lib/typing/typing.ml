open Shared

(** Type-checks the resolved AST, inferring and annotating types on every
    expression node. Returns a typed AST. *)
let type_check (_resolved : Shared_ast.resolved) :
    Shared_ast.typed Utils.Output.t =
  failwith "type_check not yet implemented"
