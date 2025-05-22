open Core
open Utils
open Shared
open Eval.Tree

(* This module defines a directed graph for representing rule dependencies.
 *
 * Vertices represent rules, with type Rule_name.t Pos.t, where:
 *   - Rule_name.t is the name of the rule
 *   - Pos.t is the position of the rule definition in the source code
 *
 * Edges represent references from one rule to another, labeled with Pos.t, where:
 *   - The source vertex is the rule containing the reference
 *   - The target vertex is the rule being referenced
 *   - The edge label (Pos.t) is the position of the reference in the source code
 *
 * The graph allows for:
 *   - Finding all rules referenced by a given rule (outgoing edges)
 *   - Finding all rules that reference a given rule (incoming edges)
 *   - Detecting cycles in the rule dependencies
 *)

module Rule_vertex = struct
  type t = Rule_name.t [@@deriving compare]

  let equal x y = 0 = compare x y

  let hash = Hashtbl.hash
end

(* Module for edge labels *)
module Ref_edge = struct
  type t = Pos.pos [@@deriving compare]

  let hash = Hashtbl.hash

  let default = Pos.dummy (* Default position for edge labels *)
end

(* Create the graph module using the functors *)
module G =
  Graph.Imperative.Digraph.ConcreteBidirectionalLabeled (Rule_vertex) (Ref_edge)
include G

let mk (ast : Eval.Tree.t) : G.t =
  (* Create a new empty graph *)
  let graph = G.create () in
  (* Helper function to find references to rules in a computation *)
  let rec find_references ({pos; value; _} : typ_computation) :
      Rule_name.t Pos.t list =
    match value with
    | Binary_op (_, left, right) ->
        find_references left @ find_references right
    | Unary_op (_, operand) ->
        find_references operand
    | Condition (cond, then_branch, else_branch) ->
        find_references cond
        @ find_references then_branch
        @ find_references else_branch
    | Const _ ->
        []
    | Ref name ->
        [Pos.mk ~pos name]
    | Get_context _ ->
        []
    | Set_context {context; value} ->
        find_references value
        @ List.concat_map context ~f:(fun (_, value) -> find_references value)
  in
  (* Add vertices and edges to the graph *)
  let add_rule_dependencies (current_rule : Rule_name.t) computation =
    G.add_vertex graph current_rule ;
    let refs = find_references computation in
    (* Add edges for each reference *)
    List.iter refs ~f:(fun ref_name ->
        let referenced_rule = Pos.value ref_name in
        (* Add the referenced rule vertex if it doesn't exist *)
        G.add_vertex graph referenced_rule ;
        (* Add an edge from the rule to the referenced rule, labeled with the reference position *)
        let edge = (current_rule, Pos.pos ref_name, referenced_rule) in
        G.add_edge_e graph edge )
  in
  (* Process all rules in the AST *)
  Hashtbl.iteri ast ~f:(fun ~key:rule_name ~data:rule_def ->
      add_rule_dependencies rule_name rule_def ) ;
  graph
