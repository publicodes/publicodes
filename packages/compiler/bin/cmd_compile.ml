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

let output_type =
  let doc = "$(docv) is the output type." in
  Arg.(
    value
    & opt
        (enum
           [ ("js", Compiler.Js)
           ; ("debug_eval_tree", Compiler.Debug_eval_tree)
           ; ("debug_typed_eval_tree", Compiler.Debug_typed_eval_tree)
           ; ("json", Compiler.Json) ] )
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
  and+ default_to_public = default_to_public
  and+ output_type = output_type in
  let target =
    let* input_files, module_path =
      if String.equal input "-" then Ok (["-"], "./")
      else
        match Utils.File.gather_module input with
        | Error (Invalid_path _) ->
            Error (`Msg "Path is invalid")
        | Error (Not_found _) ->
            Error (`Msg "Path does not exists")
        | Error (Is_not_directory _) ->
            Error (`Msg "Path is not a directory")
        | Error (Empty_directory _) ->
            Error (`Msg "Directory does not contains Publicodes files")
        | Ok files ->
            Ok (files, input)
    in
    Ok Compiler.{input_files; module_path; output_type; default_to_public}
  in
  let output_path =
    if String.equal output_file "" then
      "model.publicodes"
      ^
      match output_type with
      | Debug_typed_eval_tree | Debug_eval_tree ->
          ".eval_tree.debug"
      | Js ->
          ".js"
      | Json ->
          ".json"
    else output_file
  in
  match target with
  | Ok target ->
      Compile.compile_target target output_path
  | Error (`Msg msg) ->
      Stdlib.Format.eprintf "Error: %s\n%!" msg ;
      Cmd.Exit.cli_error
