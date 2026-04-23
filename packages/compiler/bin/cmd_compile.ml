open Base
open Cmdliner
open Utils.Result
open Cmdliner.Term.Syntax

let input =
  let doc = "$(docv) is the input module. Use $(b,-) for $(b,stdin)." in
  Arg.(required & pos 0 (some string) None & info [] ~doc ~docv:"DIR")

let output_file =
  let doc = "$(docv) is the file to write to. Use $(b,-) for $(b,stdout)." in
  Arg.(
    value
    (* With an empty string, the extension is match according the output type. *)
    & opt string ""
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
           [ ("js", Compiler.Js)
           ; ("debug_eval_tree", Compiler.Debug_eval_tree)
           ; ("json_doc", Compiler.Json_doc) ] )
        Compiler.Js
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
  let+ input = input
  and+ output_file = output_file
  and+ watch_mode = watch
  and+ default_to_public = default_to_public
  and+ output_type = output_type in
  let targets =
    let* input_files, module_ =
      if String.equal input "-" then Ok (["-"], "./")
      else
        match Utils.File.publicodes_module input with
        | Error (Invalid_path _) ->
            Error (`Msg "Path is invalid")
        | Error (Not_found _) ->
            Error (`Msg "Path does not exists")
        | Error (Is_not_directory _) ->
            Error (`Msg "Path is not a directory")
        | Error (Empty_directory _) ->
            Error (`Msg "Directory does not contains Publicodes files")
        | Error _ ->
            failwith "unreachable"
        | Ok files ->
            Ok (files, input)
    in
    let output_file =
      if String.equal output_file "" then
        "model.publicodes"
        ^
        match output_type with
        | Debug_eval_tree ->
            ".eval_tree.debug"
        | Js ->
            ".js"
        | Json_doc ->
            ".json"
      else output_file
    in
    Ok
      [ ( {input_files; module_; output_file; output_type; default_to_public}
          : Compile.t ) ]
  in
  match targets with
  | Ok (target :: []) ->
      if watch_mode then Watch.watch_compile target
      else Compile.compile_target target
  | Ok targets ->
      if watch_mode then (
        Stdlib.Format.eprintf "Can't watch mode with multiple targets yet\n%!" ;
        Cmd.Exit.cli_error )
      else Compile.compile_targets targets
  | Error (`Msg msg) ->
      Stdlib.Format.eprintf "Error: %s\n%!" msg ;
      Cmd.Exit.cli_error
