open Core
open Cmdliner
open Cmdliner.Term.Syntax
open Utils
open Format

let input_files =
  let doc = "$(docv) is the input files. Use $(b,-) for $(b,stdin)." in
  Arg.(non_empty & pos_all file ["-"] & info [] ~doc ~docv:"FILES")

let default_output_file = "model.publicodes.json"

let output_file =
  let doc = "$(docv) is the file to write to. Use $(b,-) for $(b,stdout)." in
  Arg.(
    value
    & opt string default_output_file
    & info ["o"; "output-file"] ~doc ~docv:"FILE" )

let watch =
  let doc = "Watch input files for changes and recompile automatically." in
  Arg.(value & flag & info ["w"; "watch"] ~doc)

let cmd_exit (logs : Log.t list) : Cmd.Exit.code =
  let contains_error logs =
    List.exists logs ~f:(fun log ->
        match Log.level log with `Error -> true | _ -> false )
  in
  if contains_error logs then Cmd.Exit.some_error else Cmd.Exit.ok

(* NOTE: this could be moved in the [Compiler] module. However, logging should
	 be removed from the function code. *)
let compile_to_json ast =
  let open Output in
  let* ast = Resolver.to_resolved_ast ast in
  let* eval_tree = Eval.from_resolved_ast ast |> Eval.type_check in
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
      Cli.exit_parsing_err

let watch_compile input_files output =
  (* Filter out stdin if present in input files for watching *)
  let watchable_files =
    List.filter input_files ~f:(fun f -> not (String.equal f "-"))
  in
  let recompile () =
    printf "\nFile change detected. Recompiling...\n" ;
    printf "\027[2J\027[H" ;
    (* ANSI escape code to clear screen and move cursor to top *)
    Format.print_flush () ;
    let code = compile input_files output in
    Format.print_flush () ;
    (* I want to remove all text from stdinput here, to clear the terminal *)
    if code = Cmd.Exit.ok then printf "\027[1;32mCompilation succeeded\027[0m"
    else printf "\027[1;31mCompilation failed with errors\027[0m" ;
    printf
      "\027[38;5;242m\027[3m, watching files for changes. Press Ctrl+C to \
       stop.\027[0m" ;
    Format.print_flush ()
  in
  if List.is_empty watchable_files then (
    printf "Watch mode requires at least one file to watch\n" ;
    Cmd.Exit.some_error )
  else (
    (* Initial compilation *)
    recompile () ;
    (* Setup inotify *)
    Format.print_flush () ;
    let inotify = Inotify.create () in
    (* Add watches for each input file *)
    let watches =
      List.map watchable_files ~f:(fun file ->
          let dir = Filename.dirname file in
          let filename = Filename.basename file in
          let watch =
            Inotify.add_watch inotify dir
              [Inotify.S_Modify; Inotify.S_Move; Inotify.S_Create]
          in
          (watch, filename) )
    in
    (* Watch loop *)
    let rec watch_loop (i : int) =
      let events = Inotify.read inotify in
      let should_recompile =
        (* i is even *)
        List.exists events ~f:(fun (watch, _, _, name_opt) ->
            match name_opt with
            | Some name ->
                List.exists watches ~f:(fun (w, filename) ->
                    Inotify.int_of_watch watch = Inotify.int_of_watch w
                    && String.equal name filename )
            | None ->
                false )
      in
      if should_recompile then recompile () else () ;
      watch_loop (i + 1) ;
      ()
    in
    try watch_loop 0 ; Cmd.Exit.ok
    with
    (* | Sys_unix.Break ->
        printf "\nWatch mode terminated.\n" ;
        Cmd.Exit.ok *)
    | e ->
      printf "Watch error: %s\n" (Exn.to_string e) ;
      Cmd.Exit.some_error )

let cmd =
  let doc = "Compile a Publicodes program from file or stdin." in
  let exits =
    Cmd.Exit.info Cli.exit_parsing_err ~doc:"on parsing error"
    :: Cmd.Exit.defaults
  in
  Cmd.v (Cmd.info "compile" ~doc ~version:"%%VERSION%%" ~exits)
  @@
  let+ input_files = input_files
  and+ output_file = output_file
  and+ watch_mode = watch in
  if watch_mode then watch_compile input_files output_file
  else compile input_files output_file
