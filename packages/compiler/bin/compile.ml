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
      let exit_code = cmd_exit (logs output) in
      ( if exit_code = Cmd.Exit.ok then
          match content with
          | `Json json ->
              File.write_file ~path:output_file
                ~content:(Yojson.Safe.to_string json)
          | `JS (js, _) ->
              File.write_file ~path:output_file ~content:js
          | `Debug_eval_tree debug_str ->
              File.write_file ~path:output_file ~content:debug_str ) ;
      exit_code
  | None ->
      Cmd.Exit.some_error
