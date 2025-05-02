(* open Common *)
open Utils

let compile filename string =
  let open Output in
  (* let default_options = Compiler_options.{flags= {orphan_rules= `Error}} in *)
  let* ast, rule_names =
    string
    (* Step 1: Parse the YAML string into an AST *)
    |> Yaml_parser.parse ~filename
    (* Step 2: Parse the AST into rules *)
    >>= Parser.parse ~filename
    (* Step 3: Resolve the references *)
    >>= Resolver.resolve
  in
  (* Step 4: Transform the AST into an evaluation tree *)
  let eval_tree = Eval.transform ast in
  (* Step 5: Serialize the evaluation tree to JSON *)
  let json = Eval.to_json ~rule_names eval_tree in
  return json
