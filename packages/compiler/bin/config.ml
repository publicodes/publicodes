open Base
open Cmdliner

type target_type = [`Js | `Debug_eval_tree]

type target =
  { output_file: string
  ; input_files: string list
  ; output_type: target_type
  ; default_to_public: bool }

type config = {targets: target list}

let a_to_list = function
  | `A lst ->
      Ok lst
  | _ ->
      Error (`Msg "Expected a value array")

(* TODO: possible to "open" something defining those? *)
let ( >>= ) m f = Result.bind m ~f

let ( >>| ) m f = Result.map m ~f

let ( let* ) m f = Result.bind m ~f

let yaml_target value =
  let* output_file =
    Yaml.Util.find "output" value
    >>= Result.of_option ~error:(`Msg "key not found")
    >>= Yaml.Util.to_string
    |> Result.map_error ~f:(function `Msg msg ->
        `Msg ("\"output\" field error: " ^ msg) )
  in
  let* input_files =
    Yaml.Util.find "inputs" value
    >>= Result.of_option ~error:(`Msg "key not found")
    >>= a_to_list
    >>| List.map ~f:Yaml.Util.to_string
    >>= Result.all
    |> Result.map_error ~f:(function `Msg msg ->
        `Msg ("\"inputs\" field error: " ^ msg) )
  in
  let* output_type =
    Yaml.Util.find "type" value
    >>= Result.of_option ~error:(`Msg "key not found")
    >>= Yaml.Util.to_string
    >>= (function
    | "js" ->
        Ok `Js
    | "debug_eval_tree" ->
        Ok `Debug_eval_tree
    | value ->
        Error (`Msg ("Unsupported value \"" ^ value ^ "\"")) )
    |> Result.map_error ~f:(function `Msg msg ->
        `Msg ("\"type\" field error: " ^ msg) )
  in
  let* default_to_public =
    Yaml.Util.find "default_to_public" value
    >>= Result.of_option ~error:(`Msg "key not found")
    >>= Yaml.Util.to_bool
    |> Result.map_error ~f:(function `Msg msg ->
        `Msg ("\"default_to_public\" field error: " ^ msg) )
  in
  Ok {output_type; default_to_public; output_file; input_files}

let parse_yaml ic =
  let* value =
    In_channel.input_all ic |> Yaml.of_string
    |> Result.map_error ~f:(function `Msg msg -> `Msg ("Yaml: " ^ msg))
  in
  let* targets =
    Yaml.Util.find "targets" value
    >>= Result.of_option ~error:(`Msg "key not found")
    >>= a_to_list >>| List.map ~f:yaml_target >>= Result.all
    |> Result.map_error ~f:(function `Msg msg ->
        `Msg ("\"targets\" field error: " ^ msg) )
  in
  Ok {targets}

let parse file_path =
  let* file_fpath =
    Fpath.of_string file_path
    |> Result.map_error ~f:(function _ -> `Msg "Invalid file path")
  in
  if Stdlib.Sys.file_exists file_path then
    if Fpath.has_ext "yaml" file_fpath then
      In_channel.with_open_text file_path parse_yaml
    else Error (`Msg "Unsupported format")
  else Error (`Msg "File not found")

let compile_target target =
  let {output_file; input_files; output_type; default_to_public} = target in
  Compile.compile ~input_files ~output_file ~output_type ~default_to_public

let rec compile_targets targets =
  match targets with
  | [] ->
      Cmd.Exit.ok
  | head :: tail -> (
    match compile_target head with 0 -> compile_targets tail | exit -> exit )

let compile config = compile_targets config.targets

let parse_compile file_path =
  let* config =
    parse file_path
    |> Result.map_error ~f:(function `Msg msg ->
        `Msg ("Parsing config: " ^ msg) )
  in
  Ok (compile config)
