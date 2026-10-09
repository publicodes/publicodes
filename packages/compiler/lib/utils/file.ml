open Result
open Base

type t = Fpath.t

let of_string path = Fpath.of_string path

let of_string_exn path = of_string path |> Stdlib.Result.get_ok

let to_system path = Fpath.to_string path

let pp_system ppf path = to_system path |> Stdlib.Format.fprintf ppf "'%s'"

let to_intern path = Fpath.segs path |> String.concat ~sep:"/"

let pp_intern ppf path = to_intern path |> Stdlib.Format.fprintf ppf "'%s'"

let pp = pp_intern

let equal one two = Fpath.equal one two

let compare one two = Fpath.compare one two

let t_of_sexp path = String.t_of_sexp path |> of_string_exn

let sexp_of_t path = to_intern path |> String.sexp_of_t

let std = of_string_exn "-"

let read_file file_path =
  let read ic = In_channel.input_all ic in
  Stdlib.Format.print_flush () ;
  let binary_stdin () = In_channel.set_binary_mode In_channel.stdin true in
  if equal file_path std then (binary_stdin () ; read In_channel.stdin)
  else
    let file_path = to_system file_path in
    In_channel.with_open_text file_path read

let write_file ~path ~content =
  let write s oc = Out_channel.output_string oc s in
  let binary_stdout () = Out_channel.(set_binary_mode stdout true) in
  if equal path std then (
    binary_stdout () ;
    write content Out_channel.stdout )
  else
    let path = to_system path in
    Out_channel.with_open_bin path (write content)

let is_valid_import path =
  let invalids =
    Fpath.segs path
    |> List.filter ~f:(fun seg ->
        String.is_empty seg || String.equal "." seg || String.equal ".." seg )
  in
  List.is_empty invalids

let is_valid_import_str path =
  match Fpath.of_string path with
  | Error _ ->
      false
  | Ok path ->
      is_valid_import path

let relativize dir path =
  if Fpath.segs path |> List.is_empty then None
  else if Fpath.segs path |> List.hd_exn |> String.equal "." then
    let rem = Fpath.segs path |> List.tl_exn in
    let path = List.fold rem ~init:dir ~f:Fpath.add_seg in
    Some path
  else None

type gather_module_error =
  | Invalid_path of string
  | Not_found of t
  | Is_not_directory of t
  | Empty_directory of t

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
        Ok (Fpath.append package module_)
  in
  let pathstr = Fpath.to_string path in
  if not (Stdlib.Sys.file_exists pathstr) then Error (Not_found path)
  else if not (Stdlib.Sys.is_directory pathstr) then
    Error (Is_not_directory path)
  else
    let files =
      Stdlib.Sys.readdir pathstr |> List.of_array
      |> List.map ~f:(Fpath.add_seg path)
      |> List.filter ~f:(Fpath.has_ext "publicodes")
      |> List.sort ~compare:Fpath.compare
    in
    if List.is_empty files then Error (Empty_directory path) else Ok files

type find_package_error =
  | Invalid_path of string
  | Not_found of t list
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
      | None ->
          Error Absent_env
    in
    let values =
      String.split value ~on:':'
      |> List.filter ~f:(fun part -> String.is_empty part |> not)
    in
    let* values_str =
      if List.is_empty values then Error Empty_env else Ok values
    in
    let values = List.map values_str ~f:of_string in
    if List.filter values ~f:Result.is_error |> List.is_empty then
      let values = List.map values ~f:Stdlib.Result.get_ok in
      Ok values
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
        List.map vendors ~f:(fun vendor ->
            relativize current_package vendor |> Option.value ~default:vendor )
  in
  let paths = List.map rel_vendors ~f:(fun loc -> Fpath.append loc path) in
  let existing_dirs =
    List.filter paths ~f:(fun dir ->
        let dir = to_system dir in
        Stdlib.Sys.file_exists dir && Stdlib.Sys.is_directory dir )
  in
  match List.hd existing_dirs with
  | Some directory ->
      Ok directory
  | None ->
      Error (Not_found paths)

let dirname path =
  let segs = Fpath.segs path |> List.drop_last_exn in
  let hd, rest =
    match segs with [] -> ("./", []) | hd :: rest -> (hd, rest)
  in
  let acc = Fpath.v hd in
  List.fold rest ~init:acc ~f:Fpath.add_seg

let%test_unit "dirname" =
  let dirname_str path =
    let path = of_string_exn path in
    let res = dirname path in
    to_intern res
  in
  [%test_eq: string] (dirname_str "foo/bar/toot.publicodes") "foo/bar" ;
  [%test_eq: string] (dirname_str "foo/bar/") "foo/bar" ;
  [%test_eq: string] (dirname_str "foo") "./"
