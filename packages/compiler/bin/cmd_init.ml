open Base
open Cmdliner
open Cmdliner.Term.Syntax

let output_file =
  let doc = "$(docv) is the file to write to. Use $(b,-) for $(b,stdout)." in
  Arg.(value & pos 0 string "publicodes.yaml" & info [] ~doc ~docv:"FILE")

let ( let* ) m f = Result.bind m ~f

let finish m ~f = match m with Ok m -> m | Error m -> f m

let cmd =
  let doc = "Initialize a Publicodes config file to file or stdout." in
  let exits =
    Cmd.Exit.info Cli.exit_parsing_err ~doc:"on parsing error"
    :: Cmd.Exit.defaults
  in
  Cmd.v (Cmd.info "init" ~doc ~version:"%%VERSION%%" ~exits)
  @@
  let+ output_file = output_file in
  begin
    let* output_type =
      if String.equal output_file "-" then Ok `Yaml
      else
        let* fpath =
          Fpath.of_string output_file
          |> Result.map_error ~f:(function _ -> `Msg "Invalid file path")
        in
        if Fpath.has_ext "yaml" fpath then Ok `Yaml
        else Error (`Msg "Unsupported format")
    in
    let* content =
      match output_type with
      | `Yaml ->
          Ok Config.default_yaml_str
      | _ ->
          Error (`Msg "Unknown default")
    in
    try
      Utils.File.write_file ~path:output_file ~content ;
      Stdlib.Format.eprintf "Generated %s\n%!" output_file ;
      Ok Cmd.Exit.ok
    with _ -> Error (`Msg "File write failure")
  end
  |> finish ~f:(function `Msg msg ->
      Stdlib.Format.eprintf "Error: %s\n%!" msg ;
      Cmd.Exit.cli_error )
