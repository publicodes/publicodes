open Utils

let compile filename string =
  let open Output in
  (* let default_options = Compiler_options.{flags= {orphan_rules= `Error}} in *)
  string
  (* Passe 1: Parse the YAML string into an AST *)
  |> Yaml_parser.to_yaml ~filename
  (* Passe 2: Parse the AST into rules *)
  >>= Parser.to_ast ~filename
  (* Passe 3: Resolve the references *)
  >>= Resolver.to_resolved_ast
  (* Passe 4: Transform the AST into an evaluation tree *)
  >>| Eval.from_resolved_ast
  (* Passe 5: Typecheck the evaluation tree *)
  >>| Eval.type_check
  (* Passe 5: Serialize the evaluation tree to JSON *)
  >>| Eval.to_json
