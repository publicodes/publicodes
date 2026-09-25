open Utils.Output.Let_syntax

let type_check resolved replacement_graph =
  let ast = From_resolved.from_resolved resolved in
  let* _ = Type_check.type_check ast replacement_graph in
  To_typed.to_typed ast
