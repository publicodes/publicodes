type t = Replacements_types.t

type replace_meta = Replacements_types.replace_meta

(** Build a replacement graph from the AST *)
let from_resolved_ast ast =
  ast |> Replacements_graph.build_graph |> Replacements_graph.detect_cycles

(** Apply replacements to a tree *)
let apply_replacements = Replacements_apply.apply_replacements
