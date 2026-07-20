open Shared
open Utils

type t

val from_resolved_ast : Shared.Shared_ast.resolved -> t Output.t

val transform :
     replacements:t
  -> Rule_name.t
  -> Type.t Tree.value
  -> Type.t Tree.value Output.t
