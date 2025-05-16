open Core
open Cmdliner
open Cmdliner.Term.Syntax
open Utils

let files = Arg.(non_empty & pos_all file [] & info [] ~docv:"FILE")

let compile files =
  let unresolved_program =
    List.fold files
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
  | Some _ast ->
      Log.print_ansi @@ Log.info "parsing succeeded" ;
      (* Resolver.to_resolved_ast ast ; *)
      Cmd.Exit.ok
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
  let+ files = files in
  compile files
