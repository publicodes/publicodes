open Stdlib.Format
open Cmdliner
open Fswatch

(* FIXME: should reload when adding file *)
let watch_compile (target : Compiler.t) output_path =
  let open Stdlib in
  (* Filter out stdin if present in input files for watching *)
  let watchable_files =
    Base.List.filter target.input_files ~f:(fun f -> not (String.equal f "-"))
  in
  let recompile _events =
    printf "\nFile change detected. Recompiling...\n" ;
    printf "\027[2J\027[H" ;
    (* ANSI escape code to clear screen and move cursor to top *)
    let code = Compile.compile_target target output_path in
    (* I want to remove all text from stdinput here, to clear the terminal *)
    if code = Cmd.Exit.ok then printf "\027[1;32mCompilation succeeded\027[0m"
    else printf "\027[1;31mCompilation failed with errors\027[0m" ;
    printf
      "\027[38;5;242m\027[3m, watching files for changes. Press Ctrl+C to \
       stop.\027[0m"
  in
  if List.is_empty watchable_files then (
    printf "Watch mode requires at least one file to watch\n" ;
    Cmd.Exit.some_error )
  else (
    (* Initial compilation *)
    recompile () ;
    (* reset printing *)
    print_flush () ;
    (* Setup fswatch *)
    match init_library () with
    | Status.FSW_OK ->
        let handle = init_session Monitor.System_default recompile in
        Base.List.iter watchable_files ~f:(add_path handle) ;
        start_monitor handle ;
        Cmd.Exit.ok
    | e ->
        printf "Watch error: %s\n" (Status.t_to_string e) ;
        Cmd.Exit.some_error )
