open Shared
open Utils
open Base

(** Metadata for rule replacements, including priority and scope limitations *)
type replace_meta =
  { only_in: Rule_name.t Pos.t list
        (** Rules where this replacement applies. If empty, applies to all rules *)
  ; except_in: Rule_name.t Pos.t list
        (** Rules where this replacement doesn't apply *)
  ; exclusive: bool  (** Boolean flag to assume multiple replace exclusive**) }
[@@deriving show, compare]

(** Module for rule vertices in the replacement graph *)
module Rule_vertex : sig
  type t = Rule_name.t [@@deriving equal, compare]

  val hash : t -> int
end

(** Module for edges between rules in the replacement graph *)
module Replacement_edge : sig
  type t = replace_meta Pos.t [@@deriving show, compare]

  val hash : t -> int

  val default : t
end

include
  Graph.Sig.I
    with type V.t = Rule_vertex.t
     and type V.label = Rule_vertex.t
     and type E.t = Rule_vertex.t * Replacement_edge.t * Rule_vertex.t
     and type E.label = Replacement_edge.t

module Oper : sig
  include Graph.Oper.S with type g = t
end

val mk :
     get_replacement_rules:
       (   Rule_name.t Shared.Shared_ast.rule_def
        -> Rule_name.t Shared.Shared_ast.replace list )
  -> Shared.Shared_ast.resolved
  -> t

val is_replacement_eligible :
  rule:Rule_name.t -> Rule_vertex.t * Replacement_edge.t -> bool
