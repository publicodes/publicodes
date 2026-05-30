open Result
open Base

type t = string

let pp = Stdlib.Format.pp_print_string

let read_file file_path =
  let read ic = In_channel.input_all ic in
  Stdlib.Format.print_flush () ;
  let binary_stdin () = In_channel.set_binary_mode In_channel.stdin true in
  match file_path with
  | "-" ->
      binary_stdin () ; read In_channel.stdin
  | file ->
      In_channel.with_open_bin file read

let write_file ~path ~content =
  let write s oc = Out_channel.output_string oc s in
  let binary_stdout () = Out_channel.(set_binary_mode stdout true) in
  match path with
  | "-" ->
      binary_stdout () ;
      write content Out_channel.stdout
  | file ->
      Out_channel.with_open_bin file (write content)

let is_valid_import path =
  match Fpath.of_string path with
  | Error _ ->
      false
  | Ok path ->
      let invalids =
        Fpath.segs path
        |> List.filter ~f:(fun seg ->
            String.is_empty seg || String.equal "." seg || String.equal ".." seg )
      in
      List.is_empty invalids

let relativize dir_str path_str =
  let dir = Fpath.of_string dir_str in
  let path = Fpath.of_string path_str in
  if Result.is_error dir || Result.is_error path then path_str
  else
    let dir = Stdlib.Result.get_ok dir in
    let path = Stdlib.Result.get_ok path in
    if Fpath.segs path |> List.is_empty then path_str
    else if Fpath.segs path |> List.hd_exn |> String.equal "." then
      let rem = Fpath.segs path |> List.tl_exn in
      List.fold rem ~init:dir ~f:Fpath.add_seg |> Fpath.to_string
    else path_str

type gather_module_error =
  | Invalid_path of string
  | Not_found of string
  | Is_not_directory of string
  | Empty_directory of string

let gather_module ?package module_ =
  let* path =
    match package with
    | None ->
        let* module_ =
          match Fpath.of_string module_ with
          | Ok module_ ->
              Ok module_
          | Error _ ->
              Error (Invalid_path module_)
        in
        Ok module_
    | Some package ->
        let* module_ =
          match Fpath.of_string module_ with
          | Ok module_ ->
              Ok module_
          | Error _ ->
              Error (Invalid_path module_)
        in
        let* package =
          match Fpath.of_string package with
          | Ok package ->
              Ok package
          | Error _ ->
              Error (Invalid_path package)
        in
        Ok (Fpath.append package module_)
  in
  let pathstr = Fpath.to_string path in
  if not (Stdlib.Sys.file_exists pathstr) then Error (Not_found pathstr)
  else if not (Stdlib.Sys.is_directory pathstr) then
    Error (Is_not_directory pathstr)
  else
    let files =
      Stdlib.Sys.readdir pathstr |> List.of_array
      |> List.map ~f:(Fpath.add_seg path)
      |> List.filter ~f:(Fpath.has_ext "publicodes")
      |> List.map ~f:Fpath.to_string
    in
    if List.is_empty files then Error (Empty_directory pathstr) else Ok files

type find_package_error =
  | Invalid_path of string
  | Not_found of string list
  | Absent_env
  | Empty_env
  | Invalid_env of string list

let find_package current_package path =
  let* path =
    match Fpath.of_string path with
    | Ok path ->
        Ok path
    | Error _ ->
        Error (Invalid_path path)
  in
  let* vendors =
    let* value =
      match Stdlib.Sys.getenv_opt "PUBLICODESPATH" with
      | Some value ->
          Ok value
      | None -> (
        match [%comptime_env_opt "PUBLICODESPATH"] with
        | Some value ->
            Ok value
        | None ->
            Error Absent_env )
    in
    let values =
      String.split value ~on:':'
      |> List.filter ~f:(fun part -> String.is_empty part |> not)
    in
    let* values_str =
      if List.is_empty values then Error Empty_env else Ok values
    in
    let values = List.map values_str ~f:Fpath.of_string in
    if List.filter values ~f:Result.is_error |> List.is_empty then Ok values_str
    else
      let invalids =
        List.filteri values_str ~f:(fun index _ ->
            List.nth_exn values index |> Result.is_error )
      in
      Error (Invalid_env invalids)
  in
  let rel_vendors =
    match current_package with
    | None ->
        vendors
    | Some current_package ->
        List.map vendors ~f:(relativize current_package)
  in
  let paths =
    let rel_vendors =
      List.map rel_vendors ~f:Fpath.of_string
      |> Result.all |> Stdlib.Result.get_ok
    in
    List.map rel_vendors ~f:(fun loc -> Fpath.append loc path)
    |> List.map ~f:Fpath.to_string
  in
  let existing_dirs =
    List.filter paths ~f:(fun dir ->
        Stdlib.Sys.file_exists dir && Stdlib.Sys.is_directory dir )
  in
  match List.hd existing_dirs with
  | Some directory ->
      Ok directory
  | None ->
      Error (Not_found paths)
