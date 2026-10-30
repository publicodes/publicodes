open Base
open Shared
module Rule_graph = Rule_graph

type t = Rule_graph.t

type replace = Rule_graph.replacement

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

let find_transitive_replacements ~(from : Rule_name.t) ~(rule : Rule_name.t)
    (graph : Rule_graph.t) =
  let rec loop ~acc ~todo =
    match todo with
    | [] ->
        acc
    | rule :: todo ->
        let replaces = find_replacements ~from ~rule graph in
        let acc = acc @ replaces in
        let todo = todo @ List.map replaces ~f:fst in
        loop ~acc ~todo
  in
  loop ~acc:[] ~todo:[rule]

(** A reference to a rule with the replacements inlined at its site — the same
    shape as the JSON `ref` node: [rule] is its [parameters], and the two lists
    its [replaced_by] / [made_not_applicable_by]. The root of a site is an
    [inlined_ref] whose [rule] is the referenced rule itself. *)
type inlined_ref =
  { rule: Rule_name.t
  ; replaced_by: inlined_ref list
  ; made_not_applicable_by: inlined_ref list }

(* Replacement cycles are rejected at analysis time ([Checks.cycle_check] aborts
   the compilation on any log), so the recursion below can assume the graphs are
   acyclic. *)
let rec resolve ~from ~replacement_graph ~make_not_applicable_graph ~rule :
    inlined_ref =
  { rule
  ; replaced_by=
      List.map (find_replacements ~from ~rule replacement_graph)
        ~f:(fun (r, _) ->
          resolve ~from ~replacement_graph ~make_not_applicable_graph ~rule:r )
  ; made_not_applicable_by=
      List.map (find_replacements ~from ~rule make_not_applicable_graph)
        ~f:(fun (r, _) ->
          resolve ~from ~replacement_graph ~make_not_applicable_graph ~rule:r )
  }
