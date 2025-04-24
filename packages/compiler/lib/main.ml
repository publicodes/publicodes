open Core

let compile yaml =
  let open Result in
  let transform (ast, rule) = (Eval.Main.transform ast, rule) in
  let to_json (eval_tree, rules) = Eval.To_json.to_json eval_tree rules in

  yaml |> Parser.Main.parse >>| Resolver.Main.resolve >>| transform >>| to_json
