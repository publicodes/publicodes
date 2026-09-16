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
module RuleVertex = struct
  type t = Rule_name.t [@@deriving equal, compare]

  let hash = Hashtbl.hash
end

(** Module for edges between rules in the replacement graph *)
module ReplacementEdge = struct
  type t = replace_meta Pos.t [@@deriving show, compare]

  let hash = Hashtbl.hash

  let default =
    Pos.mk ~pos:Pos.dummy {only_in= []; except_in= []; exclusive= false}
end

(** Directed graph for tracking rule replacements *)
module ReplacementGraph =
  Graph.Imperative.Digraph.ConcreteLabeled (RuleVertex) (ReplacementEdge)

type t = {replace: ReplacementGraph.t; make_not_applicable: ReplacementGraph.t}
