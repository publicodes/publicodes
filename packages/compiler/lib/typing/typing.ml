open Utils.Output.Let_syntax

let type_check inlined =
  let ast = From_resolved.from_resolved inlined in
  let* _ = Type_check.type_check ast in
  To_typed.to_typed ast
