open Base
open Compile
open Utils.Result

type t = {targets: Compile.t list}

let a_to_list = function
  | `A lst ->
      Ok lst
  | _ ->
      Error (`Msg "Expected a value array")

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
        Ok Compiler.Js
    | "debug_eval_tree" ->
        Ok Compiler.Debug_eval_tree
    | "yaml" ->
        Ok Compiler.Yaml
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
  else Error (`Msg ("File not found \"" ^ file_path ^ "\""))

let get_publicodes_files () =
  let is_publicodes_file path_str =
    Fpath.of_string path_str |> Stdlib.Result.get_ok
    |> Fpath.has_ext ".publicodes"
  in
  let rec get_all_publicodes_files dir acc =
    Stdlib.Sys.readdir (Fpath.to_string dir)
    |> Array.fold ~init:acc ~f:(fun acc entry ->
        if String.is_prefix entry ~prefix:"." then acc
        else
          let entry_path = Fpath.of_string entry |> Stdlib.Result.get_ok in
          let path = Fpath.append dir entry_path in
          let path_str = Fpath.to_string path in
          if Stdlib.Sys.is_directory path_str then
            get_all_publicodes_files path acc
          else if is_publicodes_file entry then path_str :: acc
          else acc )
  in
  let current_dir = Fpath.of_string "." |> Stdlib.Result.get_ok in
  get_all_publicodes_files current_dir [] |> List.sort ~compare:String.compare

let default_output_file =
  let default_ext = ".publicodes.js" in
  let cwd_basename =
    match Fpath.of_string (Stdlib.Sys.getcwd ()) with
    | Ok cwd ->
        Fpath.basename cwd
    | Error _ ->
        "model"
  in
  cwd_basename ^ default_ext

let create_and_get_default_input_file () =
  let src_dir = Fpath.of_string "src" |> Stdlib.Result.get_ok in
  let example_file =
    let example_file =
      Fpath.of_string "index.publicodes" |> Stdlib.Result.get_ok
    in
    Fpath.append src_dir example_file |> Fpath.to_string
  in
  ( if not (Stdlib.Sys.file_exists (Fpath.to_string src_dir)) then
      Stdlib.Sys.mkdir "src/" 0o755 ;
    if not (Stdlib.Sys.file_exists example_file) then
      let content = "exemple:\n  valeur: 10" in
      Utils.File.write_file ~path:example_file ~content ) ;
  example_file

let get_target_default_yaml () =
  let publicodes_files = get_publicodes_files () in
  let inputs =
    if List.length publicodes_files = 0 then
      [create_and_get_default_input_file ()]
    else publicodes_files
  in
  Yaml.Util.obj
    [ ("output", Yaml.Util.string default_output_file)
    ; ("inputs", Yaml.Util.list Yaml.Util.string inputs)
    ; ("type", Yaml.Util.string "js")
    ; ("default_to_public", Yaml.Util.bool false) ]

let get_default_yaml () =
  Yaml.Util.obj [("targets", `A [get_target_default_yaml ()])]

let get_default_yaml_str () = Yaml.to_string_exn (get_default_yaml ())
