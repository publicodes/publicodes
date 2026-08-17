open Base
open Shared
module Rule_graph = Rule_graph

type replacement = Rule_graph.replacement

let mk_and_checks = Checks.mk_and_checks

let find_replacements ~(from : Rule_name.t) ~(rule : Rule_name.t)
    (graph : Rule_graph.t) =
  if Rule_graph.mem_vertex graph rule then
    let replaces =
      Rule_graph.fold_succ_e
        (fun e acc ->
          let replaced_by = Rule_graph.E.dst e in
          let label = Rule_graph.E.label e in
          (replaced_by, label) :: acc )
        graph rule []
    in
    List.filter replaces ~f:(Rule_graph.is_replacement_eligible ~rule:from)
  else []
