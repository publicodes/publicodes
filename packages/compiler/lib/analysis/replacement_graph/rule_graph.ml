open Shared
open Utils
open Base

(** Metadata for rule replacements, including priority and scope limitations *)
type replacement = Rule_name.t Shared_ast.replace [@@deriving show, compare]

(** Module for rule vertices in the replacement graph *)
module Rule_vertex = struct
  type t = Rule_name.t [@@deriving equal, compare]

  let hash = Hashtbl.hash
end

(** Module for edges between rules in the replacement graph *)
module Replacement_edge = struct
  type t = replacement Mark.pos [@@deriving show, compare]

  let hash = Hashtbl.hash

  let default =
    let pos = Pos.dummy in
    Mark.mk_pos ~pos
      Shared_ast.
        { reference= Mark.mk_pos ~pos Rule_name.dummy
        ; only_in= []
        ; except_in= []
        ; exclusive= false }
end

(* Create the graph module using the functors *)
module G =
  Graph.Imperative.Digraph.ConcreteLabeled (Rule_vertex) (Replacement_edge)
include G
module Oper = Graph.Oper.I (G)
module Traverse = Graph.Traverse.Dfs (G)

let mk
    ~(get_replacement_rules :
       Shared_ast.resolved_rule_def -> Rule_name.t Shared_ast.replace list )
    (ast : Shared_ast.resolved) : G.t =
  let graph = G.create () in
  let add_replacement_edge ~rule ~replace_meta ~replaced_by =
    G.add_vertex graph rule ;
    G.add_vertex graph replaced_by ;
    G.add_edge_e graph (rule, replace_meta, replaced_by)
  in
  let process_rule_def rule_def =
    let replacement_rules = get_replacement_rules rule_def in
    List.iter replacement_rules ~f:(fun replace ->
        let replaced_rule = replace.reference in
        let replace_meta = Mark.copy replaced_rule replace in
        add_replacement_edge
          ~rule:(Mark.remove replaced_rule)
          ~replace_meta
          ~replaced_by:(Mark.remove rule_def.name) )
  in
  List.iter ast ~f:process_rule_def ;
  graph

(** Check if a replacement is eligible in the current rule context *)
let is_replacement_eligible ~(rule : Rule_name.t)
    (replacement : Rule_vertex.t * Replacement_edge.t) : bool =
  let open Rule_name in
  (* We don't replace the reference if we are in the rule that define the replacement *)
  if equal (fst replacement) rule then false
  else
    let _, meta = replacement in
    let Shared_ast.{only_in; except_in; _} = Mark.remove meta in
    (* We don't replace  *)
    let except_in = List.map ~f:Mark.remove except_in in
    let only_in = List.map ~f:Mark.remove only_in in
    let is_blacklisted = List.mem except_in rule ~equal in
    let is_whitelisted =
      List.is_empty only_in || List.mem only_in rule ~equal
    in
    (not is_blacklisted) && is_whitelisted
