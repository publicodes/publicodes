open Core
open Cmdliner
open Utils
open Utils.Output

let cmd_exit (logs : Log.t list) : Cmd.Exit.code =
  let contains_error logs =
    List.exists logs ~f:(fun log ->
        match Log.level log with `Error -> true | _ -> false )
  in
  if contains_error logs then Cmd.Exit.some_error else Cmd.Exit.ok

let compile ~input_files ~output_type ~output_file =
  let output = Compiler.compile ~input_files ~output_type in
  print_logs output ;
  match result output with
  | Some content ->
      File.write_file ~path:output_file ~content ;
      cmd_exit (logs output)
  | None ->
      Cmd.Exit.some_error

(*
  cmd_exit
  let
  let unresolved_program =
    List.fold
      ~f:(fun acc program -> Parser.Ast.merge acc program)
      ~init:[] unresolved_programs
  in
  match Output.result unresolved_program with
  | Some program -> (
      let json_output = compile_to_json program in
      Output.print_logs json_output ;
      match Output.result json_output with
      | Some json ->
          File.write_file ~path:output
            ~content:(Yojson.Safe.pretty_to_string json) ;
          cmd_exit (Output.logs json_output @ Output.logs unresolved_program)
      | None ->
          Cmd.Exit.some_error )
  | None ->
      Cli.exit_parsing_err *)
