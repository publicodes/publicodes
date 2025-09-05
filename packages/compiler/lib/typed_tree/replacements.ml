open Shared
open Shared.Shared_ast
open Shared.Eval_tree
open Utils
open Core
open Utils.Output

type replace_meta =
  { priority: int
  ; only_in: Rule_name.t Pos.t list
  ; except_in: Rule_name.t Pos.t list }

let compare_replace_meta a b = Int.compare a.priority b.priority

module RuleVertex = struct
  type t = Rule_name.t [@@deriving compare, equal]

  let hash = Hashtbl.hash
end

module ReplacedByEdge = struct
  type t = replace_meta Pos.t [@@deriving compare]

  let equal x y = 0 = compare x y

  let hash = Hashtbl.hash

  let default = Pos.mk ~pos:Pos.dummy {priority= 0; only_in= []; except_in= []}
end

module RuleGraph =
  Graph.Imperative.Digraph.ConcreteLabeled (RuleVertex) (ReplacedByEdge)

type t = RuleGraph.t

let gather (ast : Shared_ast.resolved) : t =
  let graph = RuleGraph.create () in
  let add_replacement ~rule ~replace_meta ~replaced_by =
    RuleGraph.add_vertex graph rule ;
    RuleGraph.add_vertex graph replaced_by ;
    RuleGraph.add_edge_e graph (rule, replace_meta, replaced_by)
  in
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

module CycleAnalysis = Graph.Cycles.Johnson (RuleGraph)

let check_cycle (graph : t) : t Output.t =
  let log_cycle cycle acc =
    let cycle = List.rev cycle in
    let first_rule_name = List.hd_exn cycle in
    let cycle = cycle @ [first_rule_name] in
    let pos = Pos.dummy in
    (* Assuming Pos.none for simplicity, adjust as needed *)
    let code, message = Err.cycle_detected in
    let log =
      Log.warning message ~code ~kind:`Cycle ~pos
        ~hints:
          [ String.concat ~sep:" -> "
              (List.map cycle ~f:(fun rule ->
                   Format.asprintf "%a" Rule_name.pp rule ) ) ]
    in
    log :: acc
  in
  let logs = CycleAnalysis.fold_cycles log_cycle graph [] in
  if List.is_empty logs then return ~logs graph else (None, logs)

let find_applicable_replacement ~pos ~rule ~reference graph =
  let replacements =
    RuleGraph.fold_succ_e
      (fun e acc ->
        let replaced_by = RuleGraph.E.dst e in
        let label = RuleGraph.E.label e in
        (replaced_by, label) :: acc )
      graph reference []
  in
  (* Filter replacements based on only_in, and except_in *)
  let replacements =
    List.filter replacements ~f:(fun (_, meta) ->
        let {only_in; except_in; _} = Pos.value meta in
        let except_in = List.map ~f:Pos.value except_in in
        let only_in = List.map ~f:Pos.value only_in in
        let is_blacklisted = List.mem except_in rule ~equal:Rule_name.equal in
        let is_whitelisted =
          List.is_empty only_in || List.mem only_in rule ~equal:Rule_name.equal
        in
        (not is_blacklisted) && is_whitelisted )
  in
  let duplicates =
    replacements |> List.map ~f:snd
    |> List.find_all_dups ~compare:ReplacedByEdge.compare
  in
  let logs =
    if not (List.is_empty duplicates) then
      let labels =
        List.map
          ~f:(fun meta ->
            Pos.map ~f:(fun r -> Format.asprintf "Priorité %d" r.priority) meta )
          duplicates
      in
      let code, message = Err.replace_multiple in
      let error =
        Log.error ~pos ~kind:`Replace
          ~hints:
            [ "plusieurs remplacement avec la même priorité détecté"
            ; "modifier la priorité avec : \n\
               remplace: \n\
              \    références à: ... \n\
              \    priorité: <nombre>" ]
          ~code ~labels message
      in
      [error]
    else []
  in
  let replacements =
    List.sort
      ~compare:(fun (rule_a, meta_a) (rule_b, meta_b) ->
        (* first : priority *)
        let priority_comparaison = ReplacedByEdge.compare meta_a meta_b in
        if priority_comparaison = 0 then
          (* second : alphabetical *)
          Rule_name.compare rule_a rule_b
        else priority_comparaison )
      replacements
  in
  (Option.map ~f:fst (List.hd replacements), logs)

let apply ~(tree : Tree.t) (graph : t) : Tree.t Output.t =
  let logs = ref [] in
  let apply_replacement_on_value ~(rule : Rule_name.t) (value : Tree.value) :
      Tree.value =
    Eval_tree.map
      ~f:(function
        | {value= Ref reference; pos; _} as node -> (
            let replacement, logs' =
              find_applicable_replacement ~pos ~rule ~reference graph
            in
            logs := logs' @ !logs ;
            match replacement with
            | None ->
                node
            | Some replacement ->
                let p = Tree.mk ~pos in
                (* if replacement != null then replacement else node *)
                let value =
                  Condition
                    ( p
                        (Binary_op
                           ( Pos.mk ~pos NotEq
                           , p (Ref replacement)
                           , p (Const Null) ) )
                    , p (Ref replacement)
                    , node )
                in
                {node with value} )
        | value ->
            value )
      value
  in
  let tree =
    Hashtbl.mapi
      ~f:(fun ~key:rule ~data:value -> apply_replacement_on_value ~rule value)
      tree
  in
  return ~logs:!logs tree
