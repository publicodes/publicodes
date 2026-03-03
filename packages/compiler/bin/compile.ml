open Base
open Cmdliner
open Utils
open Utils.Output

type target_type = [`Js | `Debug_eval_tree]

type target =
  { output_file: string
  ; input_files: string list
  ; output_type: target_type
  ; default_to_public: bool }

let cmd_exit (logs : Log.t list) : Cmd.Exit.code =
  let contains_error logs =
    List.exists logs ~f:(fun log ->
        match Log.level log with `Error -> true | _ -> false )
  in
  if contains_error logs then Cmd.Exit.some_error else Cmd.Exit.ok

let compile ~input_files ~output_type ~output_file ~default_to_public =
  let output = Compiler.compile ~input_files ~output_type ~default_to_public in
  print_logs output ;
  match result output with
  | Some content ->
      let exit_code = cmd_exit (logs output) in
      if exit_code = Cmd.Exit.ok then File.write_file ~path:output_file ~content ;
      exit_code
  | None ->
      Cmd.Exit.some_error

let compile_target target =
  let {output_file; input_files; output_type; default_to_public} = target in
  compile ~input_files ~output_file ~output_type ~default_to_public

let rec compile_targets targets =
  match targets with
  | [] ->
      Cmd.Exit.ok
  | head :: tail -> (
    match compile_target head with 0 -> compile_targets tail | exit -> exit )
