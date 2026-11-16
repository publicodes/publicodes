open Base
open Shared
open Utils

module type RuleGraph = sig
  include Graph.Sig.G

  val reference : E.t -> Rule_name.t * Pos.t
end

module Make (G : RuleGraph) = struct
  module Cycle_analysis = Graph.Cycles.Johnson (G)

  let compare_reference (rule1, pos1) (rule2, pos2) =
    match Pos.compare pos1 pos2 with
    | 0 ->
        Rule_name.compare rule1 rule2
    | n ->
        n

  let get_reference graph from_ to_ =
    G.find_all_edges graph from_ to_
    |> List.map ~f:G.reference
    |> List.min_elt ~compare:compare_reference
    |> Option.value_exn

  let check ?(error = Err.cycle_detected) (graph : G.t) : Log.t list =
    let log_cycle cycle acc =
      let cycle = List.rev cycle in
      match cycle with
      | [] ->
          acc
      | first_rule :: _ ->
          let cycle_full = cycle @ [first_rule] in
          let references =
            List.zip_exn cycle (List.tl_exn cycle_full)
            |> List.map ~f:(fun (from_, to_) -> get_reference graph from_ to_)
            |> List.sort ~compare:compare_reference
          in
          let _, first_ref_pos = List.hd_exn references in
          let labels =
            match references with
            | [(_, pos)] ->
                [Mark.mk_pos ~pos "la règle se référence elle-même"]
            | _ ->
                let last_index = List.length references - 1 in
                List.mapi references ~f:(fun i (ref, pos) ->
                    let is_last = i = last_index in
                    let label =
                      Printf.sprintf "règle '%s' référencée "
                        (Rule_name.to_string ref)
                      ^ if is_last then "de nouveau" else "ici"
                    in
                    Mark.mk_pos ~pos label )
          in
          let code, message = error in
          Log.warning message ~code ~kind:`Cycle ~pos:first_ref_pos ~labels
          :: acc
    in
    Cycle_analysis.fold_cycles log_cycle graph []
end
