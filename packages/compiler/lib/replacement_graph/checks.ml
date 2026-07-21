open Base
open Utils
open Shared
open Utils.Output
module Cycle_analysis = Graph.Cycles.Johnson (Rule_graph)

let cycle_check (graph : Rule_graph.t) : Log.t list =
  let log_cycle cycle acc =
    let first_rule_name = List.hd_exn cycle in
    let cycle = cycle @ [first_rule_name] in
    let pos = Pos.dummy in
    let code, message = Err.cycle_detected in
    let cycle_path =
      String.concat ~sep:" -> "
        (List.map cycle ~f:(fun rule ->
             Stdlib.Format.asprintf "%a" Rule_name.pp rule ) )
    in
    let log = Log.warning message ~code ~kind:`Cycle ~pos ~hints:[cycle_path] in
    log :: acc
  in
  Cycle_analysis.fold_cycles log_cycle graph []

let exclusive_duplicate_check (graph : Rule_graph.t) : Log.t list =
  let log_exclusive_duplicate rule acc =
    let replaces =
      Rule_graph.succ_e graph rule
      |> List.map ~f:(fun (_, replace, src) -> (src, replace))
      |> List.filter ~f:(Rule_graph.is_replacement_eligible ~rule)
      |> List.map ~f:snd
    in
    if List.length replaces <= 1 then acc
    else
      let without_exclusive =
        List.filter_map replaces ~f:(fun replace ->
            if not (Pos.value replace).exclusive then Some replace else None )
      in
      if List.is_empty without_exclusive then acc
      else
        let labels =
          List.map without_exclusive ~f:(fun (_, pos) -> Pos.mk ~pos "ici")
        in
        let code, message = Err.replace_multiple in
        let error =
          Log.error ~kind:`Replace
            ~hints:
              [ "Plusieurs remplacements pour la même règle détectés."
              ; "Utilisez des « remplace » chainés s'il est question de \
                 priorité métier ou ajoutez un attribut « exclusif: oui »" ]
            ~code ~labels message
        in
        error :: acc
  in
  Rule_graph.fold_vertex log_exclusive_duplicate graph []

let mk_and_checks ast =
  let replacement_graph =
    Rule_graph.mk ast ~get_replacement_rules:(fun rule -> rule.replace)
  in
  let replacement_cycle_logs = cycle_check replacement_graph in
  let exclusive_duplicate_logs = exclusive_duplicate_check replacement_graph in
  let make_not_applicable_graph =
    Rule_graph.mk ast ~get_replacement_rules:(fun rule ->
        rule.make_not_applicable )
  in
  let make_not_applicable_cycle_logs = cycle_check make_not_applicable_graph in
  let logs =
    replacement_cycle_logs @ make_not_applicable_cycle_logs
    @ exclusive_duplicate_logs
  in
  break ~logs (replacement_graph, make_not_applicable_graph)
