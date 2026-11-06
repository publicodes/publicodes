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

val transform :
     make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Shared.Shared_ast.typed
  -> Rule_name.t
  -> Typ.t option Tree.value
  -> Typ.t option Tree.value
