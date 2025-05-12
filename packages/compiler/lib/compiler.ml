open Utils
open Shared
open Core

let compile filename string =
  let open Output in
  (* let default_options = Compiler_options.{flags= {orphan_rules= `Error}} in *)
  let* ast =
    string
    (* Passe 1: Parse the YAML string into an AST *)
    |> Yaml_parser.to_yaml ~filename
    (* Passe 2: Parse the AST into rules *)
    >>= Parser.to_ast ~filename
    (* Passe 3: Resolve the references *)
    >>= Resolver.to_resolved_ast
  in
  (* Passe 4: Transform the AST into an evaluation tree *)
  let eval_ast = Eval.from_resolved_ast ast in
  (* Passe 5: Typecheck the evaluation tree *)
  let* _ = Eval.type_check eval_ast in
  (* Passe 6: Check for cycle *)
  let* dependency_graph = Dependency_graph.cycle_check ~filename eval_ast in
  (* Passe 7: Extract parameter of the model *)
  let parameters = Dependency_graph.extract_parameters ~ast dependency_graph in
  let parameters =
    Rule_name.Set.of_list
      (List.fold ~f:(fun acc a -> acc @ snd a) ~init:[] parameters)
  in
  (* Passe 8: Print parameters *)
  Format.printf "Parameters: " ;
  Format.pp_print_list
    ~pp_sep:(fun fmt () -> Format.fprintf fmt ", ")
    Rule_name.pp Format.std_formatter (Set.to_list parameters) ;
  Format.printf "\n" ;
  (* Passe 9: Serialize the evaluation tree to JSON *)
  return (Eval.to_json eval_ast)
