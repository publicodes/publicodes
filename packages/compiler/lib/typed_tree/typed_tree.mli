module Typ = Typ
open Utils

type t = Typ.t Shared.Eval_tree.t

type value = Typ.t Shared.Eval_tree.value

val mk :
     pos:Utils.Pos.pos
  -> Typ.t Shared.Eval_tree.naked_value
  -> Typ.t Shared.Eval_tree.value

val from_resolved_ast : Shared.Shared_ast.resolved -> t
(** [from_ast resolved_ast] converts a [Shared_ast.resolved] to a typed tree,
    which can then be typed checked with [type_check]. *)

val type_check : t -> t Output.t
(** [type_check typed_tree] type checks a typed tree and returns the same tree
    with all types unified. *)
