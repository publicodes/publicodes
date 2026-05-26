open Option
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

let is_valid ~allow_relative path =
  match Fpath.of_string path with
  | Error _ ->
      false
  | Ok path ->
      Fpath.segs path
      |> List.filteri ~f:(fun i seg ->
          if String.is_empty seg then true
          else if i = 0 && String.equal "." seg then not allow_relative
          else if String.equal "." seg then true
          else if String.equal ".." seg then true
          else false )
      |> List.is_empty

let relativize_exn dir path =
  let dir = Fpath.of_string dir |> Stdlib.Result.get_ok in
  let path = Fpath.of_string path |> Stdlib.Result.get_ok in
  if Fpath.segs path |> List.hd_exn |> String.equal "." then
    Fpath.append dir path |> Fpath.to_string
  else Fpath.to_string path

let publicodes_module ?package module_ =
  let* path =
    match package with
    | None -> (
      match Fpath.of_string module_ with
      | Error _ ->
          None
      | Ok module_ ->
          Some module_ )
    | Some package ->
        let package = Fpath.of_string package in
        let module_ = Fpath.of_string module_ in
        if Result.is_error package || Result.is_error module_ then None
        else
          let package = Stdlib.Result.get_ok package in
          let module_ = Stdlib.Result.get_ok module_ in
          Some (Fpath.append package module_)
  in
  let pathstr = Fpath.to_string path in
  if not (Stdlib.Sys.file_exists pathstr) then None
  else if not (Stdlib.Sys.is_directory pathstr) then None
  else
    let files =
      Stdlib.Sys.readdir pathstr |> List.of_array
      |> List.map ~f:(Fpath.add_seg path)
      |> List.filter ~f:(Fpath.has_ext "publicodes")
      |> List.map ~f:Fpath.to_string
    in
    if List.is_empty files then None else Some files

let publicodes_package current_package path =
  let _current_package = current_package in
  let* path =
    match Fpath.of_string path with Error _ -> None | Ok path -> Some path
  in
  let* vendors =
    match Stdlib.Sys.getenv_opt "PUBLICODESPATH" with
    | None ->
        Stdlib.Printf.eprintf "Warning: missing PUBLICODESPATH\n" ;
        None
    | Some value ->
        let values =
          String.split value ~on:':'
          |> List.filter ~f:(function str -> not (String.equal "" str))
        in
        Some values
  in
  let valid_vendors = List.filter vendors ~f:(is_valid ~allow_relative:true) in
  if List.length vendors <> List.length valid_vendors then
    Stdlib.Printf.eprintf "Warning: invalid PUBLICODESPATH\n" ;
  let vendors =
    let relative_vendors =
      match current_package with
      | None ->
          vendors
      | Some current_package ->
          List.map valid_vendors ~f:(relativize_exn current_package)
    in
    List.map relative_vendors ~f:Fpath.of_string
    |> Result.all |> Stdlib.Result.get_ok
  in
  let directories =
    List.map vendors ~f:(function loc -> Fpath.append loc path)
  in
  let existing_directories =
    List.filter directories ~f:(function dir ->
        let dir = Fpath.to_string dir in
        if not (Stdlib.Sys.file_exists dir) then false
        else if not (Stdlib.Sys.is_directory dir) then false
        else true )
  in
  let* directory = List.hd existing_directories in
  Some (Fpath.to_string directory)
