open Shared
open Utils
open Core

(** Metadata for rule replacements, including priority and scope limitations *)
type replace_meta =
  { priority: int
  ; only_in: Rule_name.t Pos.t list  (** Rules where this replacement applies *)
  ; except_in: Rule_name.t Pos.t list
        (** Rules where this replacement doesn't apply *) }
[@@deriving show]

(** Compare replacement metadata based on priority *)
let compare_replace_meta a b = Int.compare a.priority b.priority

(** Module for rule vertices in the replacement graph *)
module RuleVertex = struct
  type t = Rule_name.t [@@deriving compare, equal]

  let hash = Hashtbl.hash
end

(** Module for edges between rules in the replacement graph *)
module ReplacementEdge = struct
  type t = replace_meta Pos.t [@@deriving show]

  let compare a b = compare_replace_meta (Pos.value a) (Pos.value b)

  let equal x y = 0 = compare x y

  let hash = Hashtbl.hash

  let default = Pos.mk ~pos:Pos.dummy {priority= 0; only_in= []; except_in= []}
end

(** Directed graph for tracking rule replacements *)
module ReplacementGraph =
  Graph.Imperative.Digraph.ConcreteLabeled (RuleVertex) (ReplacementEdge)

(** Type alias for the rule replacement graph *)
type t = ReplacementGraph.t
