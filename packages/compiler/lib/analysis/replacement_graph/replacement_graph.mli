(** Dependency graph analysis. *)

open Shared

type t = Rule_graph.t

type replace = Rule_graph.replacement

val mk_and_checks : Shared_ast.resolved -> (t * t) Utils.Output.t

val find_transitive_replacements :
     from:Rule_name.t
  -> rule:Rule_name.t
  -> t
  -> (Rule_name.t * replace Utils.Mark.pos) list

(** A reference to a rule with the replacements inlined at its site — the same
    shape as the JSON `ref` node: [rule] is its [parameters], and the two lists
    its [replaced_by] / [made_not_applicable_by]. The root of a site is an
    [inlined_ref] whose [rule] is the referenced rule itself. *)
type inlined_ref =
  { rule: Rule_name.t
  ; replaced_by: inlined_ref list
  ; made_not_applicable_by: inlined_ref list }

val resolve :
     from:Rule_name.t
  -> replacement_graph:t
  -> make_not_applicable_graph:t
  -> rule:Rule_name.t
  -> inlined_ref

module Rule_graph = Rule_graph
