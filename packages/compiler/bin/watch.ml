open Stdlib.Format
open Cmdliner

let watch_compile ~input_files:_ ~output_file:_ ~output_type:_
    ~default_to_public:_ =
  printf "\027[1;31mWatch mode is only supported on linux for now\027[0m" ;
  Cmd.Exit.cli_error
[@@config not (target_os = "linux")]

let watch_compile ~input_files ~output_file ~output_type ~default_to_public =
  let open Stdlib in

  (* Filter out stdin if present in input files for watching *)
  let watchable_files =
    Base.List.filter input_files ~f:(fun f -> not (String.equal f "-"))
  in
  let recompile () =
    printf "\nFile change detected. Recompiling...\n" ;
    printf "\027[2J\027[H" ;
    (* ANSI escape code to clear screen and move cursor to top *)
    print_flush () ;
    let code =
      Compile.compile ~input_files ~output_file ~output_type ~default_to_public
    in
    print_flush () ;
    (* I want to remove all text from stdinput here, to clear the terminal *)
    if code = Cmd.Exit.ok then printf "\027[1;32mCompilation succeeded\027[0m"
    else printf "\027[1;31mCompilation failed with errors\027[0m" ;
    printf
      "\027[38;5;242m\027[3m, watching files for changes. Press Ctrl+C to \
       stop.\027[0m" ;
    print_flush ()
  in
  if List.is_empty watchable_files then (
    printf "Watch mode requires at least one file to watch\n" ;
    Cmd.Exit.some_error )
  else (
    (* Initial compilation *)
    recompile () ;
    (* Setup inotify *)
    print_flush () ;
    let inotify = Inotify.create () in
    (* Add watches for each input file *)
    let watches =
      Base.List.map watchable_files ~f:(fun file ->
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
        Base.List.exists events ~f:(fun (watch, _, _, name_opt) ->
            match name_opt with
            | Some name ->
                Base.List.exists watches ~f:(fun (w, filename) ->
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
      printf "Watch error: %s\n" (Base.Exn.to_string e) ;
      Cmd.Exit.some_error )
[@@config any (target_os = "linux")]
