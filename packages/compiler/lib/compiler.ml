open Core
open Utils
open Utils.Output

(* NOTE: this could be moved in the [Compiler] module. However, logging should
	 be removed from the function code. *)
let to_unresolved_ast ~input_files =
  let+ unresolved_programs =
    List.map input_files ~f:(fun filename ->
        (* Read the file content *)
        let file_content = File.read_file filename in
        (* Parse the file content *)
        Yaml_parser.to_yaml ~filename file_content >>= Parser.to_ast ~filename )
    |> all_keep_logs
  in
  List.fold
    ~f:(fun acc program -> Parser.Ast.merge acc program)
    ~init:[] unresolved_programs

let to_typed_tree ~ast =
  let* resolved_ast = Resolver.to_resolved_ast ast in
  let typed_tree = Typed_tree.from_resolved_ast resolved_ast in
  let* typed_tree_checked = Typed_tree.type_check typed_tree in
  return typed_tree_checked

let get_parameters ~ast ~eval_tree =
  Dependency_graph.cycle_check eval_tree
  >>= Dependency_graph.extract_parameters ~ast ~tree:eval_tree

let compile ~input_files ~output_type =
  let open Output in
  let* ast = to_unresolved_ast ~input_files in
  let* typed_tree = to_typed_tree ~ast in
  let eval_tree = Hashed_tree.from_typed_tree typed_tree in
  let* parameters = get_parameters ~ast ~eval_tree in
  let+ result_string =
    match output_type with
    | `Json ->
        let json = Hashed_tree.to_json eval_tree parameters in
        return (`Json json)
    | `Debug_eval_tree ->
        return
          (`Debug_eval_tree
             (Shared.Eval_tree_printer.to_string_eval_tree eval_tree) )
    | `JS ->
        let output = Hashed_tree.to_js typed_tree parameters in
        return (`JS output)
  in
  result_string
