open Shared
open Shared.Shared_ast
open Utils
open Core
open Utils.Output
open Replacements_types

(** Build a replacement graph from the AST *)
let build_graph (ast : Shared_ast.resolved) : t =
  let graph = ReplacementGraph.create () in
  (* Add a replacement edge to the graph *)
  let add_replacement ~rule ~replace_meta ~replaced_by =
    ReplacementGraph.add_vertex graph rule ;
    ReplacementGraph.add_vertex graph replaced_by ;
    ReplacementGraph.add_edge_e graph (rule, replace_meta, replaced_by)
  in
  (* Process a single rule definition *)
  let process_rule_def rule_def =
    List.iter rule_def.replace ~f:(fun replace ->
        List.iter replace.references ~f:(fun replaced_rule ->
            let replace_meta =
              Pos.mk ~pos:(Pos.pos replaced_rule)
                { priority= replace.priority
                ; only_in= replace.only_in
                ; except_in= replace.except_in }
            in
            add_replacement ~rule:(Pos.value replaced_rule) ~replace_meta
              ~replaced_by:(Pos.value rule_def.name) ) )
  in
  List.iter ast ~f:process_rule_def ;
  graph

(** Module for cycle detection in the replacement graph *)
module CycleAnalysis = Graph.Cycles.Johnson (ReplacementGraph)

(** Detect cycles in the replacement graph *)
let detect_cycles (graph : t) : t Output.t =
  let log_cycle cycle acc =
    let first_rule_name = List.hd_exn cycle in
    let cycle = cycle @ [first_rule_name] in
    let pos = Pos.dummy in
    let code, message = Err.cycle_detected in
    let cycle_path =
      String.concat ~sep:" -> "
        (List.map cycle ~f:(fun rule -> Format.asprintf "%a" Rule_name.pp rule))
    in
    let log = Log.warning message ~code ~kind:`Cycle ~pos ~hints:[cycle_path] in
    log :: acc
  in
  let logs = CycleAnalysis.fold_cycles log_cycle graph [] in
  if List.is_empty logs then return ~logs graph else (None, logs)

(** Check if a replacement is applicable in the current rule context *)
let is_replacement_applicable ~(rule : Rule_name.t)
    (replacement : Rule_name.t * ReplacementEdge.t) : bool =
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

let find_replacements ~(rule : Rule_name.t) (graph : t) =
  if ReplacementGraph.mem_vertex graph rule then
    ReplacementGraph.fold_succ_e
      (fun e acc ->
        let replaced_by = ReplacementGraph.E.dst e in
        let label = ReplacementGraph.E.label e in
        (replaced_by, label) :: acc )
      graph rule []
  else []
