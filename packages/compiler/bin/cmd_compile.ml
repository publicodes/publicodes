open Core
open Cmdliner
open Cmdliner.Term.Syntax
open Utils

let input_files =
  let doc = "$(docv) is the input files. Use $(b,-) for $(b,stdin)." in
  Arg.(non_empty & pos_all file ["-"] & info [] ~doc ~docv:"FILES")

let output_file =
  let doc = "$(docv) is the file to write to. Use $(b,-) for $(b,stdout)" in
  Arg.(value & opt string "-" & info ["o"; "output-file"] ~doc ~docv:"FILE")

(* NOTE: this could be moved in the [Compiler] module. However, logging should
	 be removed from the function code. *)
let compile_to_json ast =
  let open Output in
  let* ast = Resolver.to_resolved_ast ast in
  Log.print_ansi @@ Log.info "name resolution succeeded" ;
  let* eval_tree = Eval.from_resolved_ast ast |> Eval.to_typed_tree in
  Log.print_ansi @@ Log.info "eval tree type checking succeeded" ;
  let* parameters =
    Dependency_graph.cycle_check eval_tree
    >>= Dependency_graph.extract_parameters ~ast ~eval_tree
  in
  return (Eval.to_json eval_tree parameters)

let compile input_files output =
  let unresolved_program =
    List.fold input_files
      ~f:(fun (acc : Parser.Ast.t Output.t) filename ->
        let open Output in
        (* Read the file content *)
        let file_content = File.read_file filename in
        let* current_program = acc in
        (* Parse the file content *)
        let+ new_program =
          Yaml_parser.to_yaml ~filename file_content >>= Parser.to_ast ~filename
        in
        Parser.Ast.merge current_program new_program )
      ~init:(Output.return [])
  in
  Output.print_logs unresolved_program ;
  match Output.result unresolved_program with
  | Some program -> (
      Log.print_ansi @@ Log.info "parsing succeeded" ;
      let json_output = compile_to_json program in
      Output.print_logs json_output ;
      match Output.result json_output with
      | Some json ->
          File.write_file ~path:output ~content:(Yojson.Safe.to_string json) ;
          Cmd.Exit.ok
      | None ->
          Cmd.Exit.some_error )
  | None ->
      Cli.exit_parsing_err

let cmd =
  let doc = "Compile a Publicodes program from file or stdin." in
  let exits =
    Cmd.Exit.info Cli.exit_parsing_err ~doc:"on parsing error"
    :: Cmd.Exit.defaults
  in
  Cmd.v (Cmd.info "compile" ~doc ~version:"%%VERSION%%" ~exits)
  @@
  let+ input_files = input_files and+ output_file = output_file in
  compile input_files output_file
