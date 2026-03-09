open Base
open Cmdliner
open Cmdliner.Term.Syntax

let output_file =
  let doc = "$(docv) is the file to write to. Use $(b,-) for $(b,stdout)." in
  Arg.(value & pos 0 string "publicodes.yaml" & info [] ~doc ~docv:"FILE")

let ( let* ) m f = Result.bind m ~f

let cmd =
  let doc = "Initialize a Publicodes config file to file or stdout." in
  let exits =
    Cmd.Exit.info Cli.exit_parsing_err ~doc:"on parsing error"
    :: Cmd.Exit.defaults
  in
  Cmd.v (Cmd.info "init" ~doc ~version:"%%VERSION%%" ~exits)
  @@
  let+ output_file = output_file in
  let res =
    let* output_file =
      if Stdlib.Sys.file_exists output_file then
        Error
          (`Msg
             (Stdlib.Format.sprintf "the file \"%s\" already exists" output_file)
          )
      else Ok output_file
    in
    let content = Config.get_default_yaml_str () in
    try
      Utils.File.write_file ~path:output_file ~content ;
      Stdlib.Format.eprintf "Project correclty initialized with \"%s\"\n%!"
        output_file ;
      Ok Cmd.Exit.ok
    with _ -> Error (`Msg "File write failure")
  in
  match res with
  | Ok code ->
      code
  | Error (`Msg msg) ->
      Stdlib.Format.eprintf "Error: %s\n%!" msg ;
      Cmd.Exit.cli_error
