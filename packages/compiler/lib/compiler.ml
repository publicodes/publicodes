open Core

let compile filename string =
  let open Result in
  let transform (ast, rule) = (Eval.transform ast, rule) in
  let to_json (eval_tree, rules) = Eval.to_json eval_tree rules in

  string |> Yaml_parser.parse filename >>= Parser.parse >>| Resolver.resolve
  >>| transform >>| to_json
