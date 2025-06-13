open Base
open Cmdliner
open Cmdliner.Term.Syntax

let input_files =
  let doc = "$(docv) is the input files. Use $(b,-) for $(b,stdin)." in
  Arg.(value & pos_all file [] & info [] ~doc ~docv:"FILES")

let input_stdin =
  let doc = "Use stdin as input to compile." in
  Arg.(value & flag & info ["i"; "input"] ~doc)

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
    & opt (enum [("json", `Json); ("debug_eval_tree", `Debug_eval_tree)]) `Json
    & info ["t"; "output-type"] ~doc ~docv:"TYPE" )

let default_to_public =
  let doc =
    "Compile every rule as `public`, which means that they are all exported."
  in
  Arg.(value & flag & info ["default-to-public"] ~doc)

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
  and+ input_stdin = input_stdin
  and+ watch_mode = watch
  and+ default_to_public = default_to_public
  and+ output_type = output_type in
  let input_files = if input_stdin then ["-"] else input_files in
  if Base.List.length input_files = 0 then (
    Stdlib.Format.eprintf
      "No input publicodes file provided.\n\
       Try `publicodes compile --help` for more information.\n\
       %!" ;
    Cmd.Exit.cli_error )
  else if watch_mode then
    Watch.watch_compile ~input_files ~output_file ~output_type
      ~default_to_public
  else Compile.compile ~input_files ~output_file ~output_type ~default_to_public
