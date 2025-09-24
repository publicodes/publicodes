
let rec to_json (yaml: Ast.t) : Yojson.Safe.t =
  match yaml with
  | `Scalar scalar ->
      `String (Ast.get_value scalar)
  | `A sequence ->
      `List (List.map (to_json ) sequence)
  | `O mapping ->
      `Assoc (
        List.map (fun (key, yaml) ->
          (Ast.get_value key, to_json yaml)
        ) mapping
      )
