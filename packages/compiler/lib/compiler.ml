open Utils
open Core

let compile_file content ~filename =
  let open Output in
  (* let default_options = Compiler_options.{flags= {orphan_rules= `Error}} in *)
  let* ast =
    (* Passe 1: Parse the YAML string into an AST *)
    Yaml_parser.to_yaml ~filename content
    (* Passe 2: Parse the AST into rules *)
    >>= Parser.to_ast ~filename
    (* Passe 3: Resolve the references *)
    >>= Resolver.to_resolved_ast
  in
  let* eval_tree =
    ast
    (* Passe 4: Transform the AST into an evaluation tree *)
    |> Eval.from_resolved_ast
    (* Passe 5: Typecheck the evaluation tree *)
    |> Eval.to_typed_tree
  in
  let* parameters =
    eval_tree
    (* Passe 6: Compute dependencies and check for cycle  *)
    |> Dependency_graph.cycle_check ~filename
    (* Passe 7: Extract parameter of the model *)
    >>= Dependency_graph.extract_parameters ~ast ~eval_tree
  in
  (* Passe 8: Serialize the evaluation tree to JSON *)
  return (Typescript.generate ~eval_tree ~parameters)
