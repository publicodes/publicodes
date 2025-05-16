open Core
open Cmdliner
open Cmdliner.Term.Syntax

let exit_syntax_err = 1

let files = Arg.(non_empty & pos_all file [] & info [] ~docv:"FILE")

let compile files =
  let unresolved_program =
    List.fold files
      ~f:(fun (acc : Parser.Ast.t Utils.Output.t) filename ->
        let open Utils.Output in
        (* Read the file content *)
        let file_content = Utils.File.read_file filename in
        let* current_program = acc in
        (* Parse the file content *)
        let+ new_program =
          Yaml_parser.to_yaml ~filename file_content >>= Parser.to_ast ~filename
        in
        Parser.Ast.merge current_program new_program )
      ~init:(Utils.Output.return [])
  in
  match unresolved_program with
  | Some _, [] ->
      Printf.printf "Parsing ok\n" ;
      (* Printf.printf "program: %s\n" (Parser.Ast.show p) ; *)
      Cmd.Exit.ok
  | Some _, _ ->
      Printf.printf "Parsing ok, but with errors:\n" ;
      (* Printf.printf "program: %s\n" (Parser.Ast.show p) ; *)
      Utils.Output.print_logs unresolved_program ;
      Cmd.Exit.some_error
  | None, _ ->
      Printf.printf "Parsing failed:\n" ;
      Utils.Output.print_logs unresolved_program ;
      Cmd.Exit.some_error

let cmd =
  let doc = "Compile a Publicodes program from file or stdin." in
  let exits =
    Cmd.Exit.info exit_syntax_err ~doc:"on syntax error" :: Cmd.Exit.defaults
  in
  Cmd.v (Cmd.info "compile" ~doc ~version:"%%VERSION%%" ~exits)
  @@
  let+ files = files in
  compile files
