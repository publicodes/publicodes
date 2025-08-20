open Core
open Cmdliner
open Cmdliner.Term.Syntax

let input_files =
  let doc = "$(docv) is the input files. Use $(b,-) for $(b,stdin)." in
  Arg.(non_empty & pos_all file ["-"] & info [] ~doc ~docv:"FILES")

let default_output_file = "model.publicodes.js"

let output_file =
  let doc = "$(docv) is the file to write to. Use $(b,-) for $(b,stdout)." in
  Arg.(
    value
    & opt string default_output_file
    & info ["o"; "output-file"] ~doc ~docv:"FILE" )

let watch =
  let doc = "Watch input files for changes and recompile automatically." in
  Arg.(value & flag & info ["w"; "watch"] ~doc)

let output_type =
  let doc = "$(docv) is the output type." in
  Arg.(
    value
    & opt
        (enum
           [ ("json", `Json)
           ; ("debug_eval_tree", `Debug_eval_tree)
           ; ("JavaScript", `JS) ] )
        `Json
    & info ["t"; "output-type"] ~doc ~docv:"TYPE" )

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
  and+ watch_mode = watch
  and+ output_type = output_type in
  if watch_mode then Watch.watch_compile ~input_files ~output_file ~output_type
  else Compile.compile ~input_files ~output_file ~output_type
