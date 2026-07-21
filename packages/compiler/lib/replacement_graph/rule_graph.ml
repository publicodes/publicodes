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
module Rule_vertex = struct
  type t = Rule_name.t [@@deriving equal, compare]

  let hash = Hashtbl.hash
end

(** Module for edges between rules in the replacement graph *)
module Replacement_edge = struct
  type t = replace_meta Pos.t [@@deriving show, compare]

  let hash = Hashtbl.hash

  let default =
    Pos.mk ~pos:Pos.dummy {only_in= []; except_in= []; exclusive= false}
end

(* Create the graph module using the functors *)
module G =
  Graph.Imperative.Digraph.ConcreteLabeled (Rule_vertex) (Replacement_edge)
include G
module Oper = Graph.Oper.I (G)
module Traverse = Graph.Traverse.Dfs (G)

let mk
    ~(get_replacement_rules :
       'a Shared_ast.rule_def -> 'a Shared_ast.replace list )
    (ast : Shared_ast.resolved) : G.t =
  let graph = G.create () in
  (* Add a replacement edge to the graph *)
  let add_replacement ~rule ~replace_meta ~replaced_by =
    G.add_vertex graph rule ;
    G.add_vertex graph replaced_by ;
    G.add_edge_e graph (rule, replace_meta, replaced_by)
  in
  (* Process a single rule definition *)
  let process_rule_def rule_def =
    List.iter (get_replacement_rules rule_def) ~f:(fun replace ->
        let replaced_rule = replace.reference in
        let replace_meta =
          Pos.mk ~pos:(Pos.pos replaced_rule)
            { only_in= replace.only_in
            ; except_in= replace.except_in
            ; exclusive= replace.exclusive }
        in
        add_replacement ~rule:(Pos.value replaced_rule) ~replace_meta
          ~replaced_by:(Pos.value rule_def.name) )
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
    let {only_in; except_in; _} = Pos.value meta in
    (* We don't replace  *)
    let except_in = List.map ~f:Pos.value except_in in
    let only_in = List.map ~f:Pos.value only_in in
    let is_blacklisted = List.mem except_in rule ~equal in
    let is_whitelisted =
      List.is_empty only_in || List.mem only_in rule ~equal
    in
    (not is_blacklisted) && is_whitelisted
