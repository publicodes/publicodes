open Utils.Output
open Replacements_types

type t = Replacements_types.t

type replace_meta = Replacements_types.replace_meta

(** Build a replacement graph from the AST *)
let from_resolved_ast ast =
  let* replacement_graph =
    ast
    |> Replacements_graph.build_graph ~get_replacement_rules:(fun rule ->
           rule.replace )
    |> Replacements_graph.detect_cycles
  in
  let* make_not_applicable_graph =
    ast
    |> Replacements_graph.build_graph ~get_replacement_rules:(fun rule ->
           rule.make_not_applicable )
    |> Replacements_graph.detect_cycles
  in
  return
    {replace= replacement_graph; make_not_applicable= make_not_applicable_graph}

(** Apply replacements to a tree *)
let apply_replacements = Tree_transform.apply_replacements
