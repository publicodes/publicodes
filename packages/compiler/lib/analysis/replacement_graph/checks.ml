open Base
open Utils
open Utils.Output

module Cycle_analysis = Cycles.Make (struct
  include Rule_graph

  let reference ((rule, (_, pos_mark), _) : Rule_graph.edge) =
    (rule, pos_mark.pos)
end)

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
            if not (Mark.remove replace).exclusive then Some replace else None )
      in
      if List.is_empty without_exclusive then acc
      else
        let labels =
          List.map without_exclusive ~f:(Mark.map ~f:(fun _ -> "ici"))
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
  let make_not_applicable_graph =
    Rule_graph.mk ast ~get_replacement_rules:(fun rule ->
        rule.make_not_applicable )
  in
  let full_graph =
    Rule_graph.Oper.union replacement_graph make_not_applicable_graph
  in
  let cycle_logs = Cycle_analysis.check ~error:Err.replace_cycle full_graph in
  let exclusive_duplicate_logs = exclusive_duplicate_check replacement_graph in
  let logs = cycle_logs @ exclusive_duplicate_logs in
  break ~logs (replacement_graph, make_not_applicable_graph)
