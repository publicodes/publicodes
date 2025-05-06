(* open Common *)
open Utils

let compile filename string =
  let open Output in
  (* let default_options = Compiler_options.{flags= {orphan_rules= `Error}} in *)
  let* ast, rule_names =
    string
    (* Step 1: Parse the YAML string into an AST *)
    |> Yaml_parser.to_yaml ~filename
    (* Step 2: Parse the AST into rules *)
    >>= Parser.to_ast ~filename
    (* Step 3: Resolve the references *)
    >>= Resolver.to_resolved_ast
  in
  (* Step 4: Transform the AST into an evaluation tree *)
  let eval_tree = Eval.from_resolved_ast ast in
  (* Step 5: Serialize the evaluation tree to JSON *)
  let json = Eval.to_json ~rule_names eval_tree in
  return json
