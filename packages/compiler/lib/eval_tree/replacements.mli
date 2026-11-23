open Shared
open Utils

val inline_ref :
     pos:Pos.t
  -> meta:'a option
  -> Shared_ast.inlined_ref
  -> 'a option Tree.value
  -> 'a option Tree.value
(** [inline_ref ~pos ~meta inlined node] wraps [node] with the rules that replace
    the reference [inlined] stands for. *)
