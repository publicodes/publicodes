open Compiler
open Core

let () =
  match Sys.get_argv () with
  | [| _; file_path |] -> (
      print_endline ("Reading file: " ^ file_path);
      let raw_content = Utils.File.read_file file_path in

      match compile raw_content with
      | Ok program -> print_endline (Yojson.Safe.to_string program)
      | Error err ->
          print_endline ("Error compiling: " ^ err);
          exit 1)
  | _ ->
      print_endline "Usage: ./main <file_path>";
      exit 1

(* Yaml_parser.print_yaml yaml;
Yaml.to_json yaml
|> Result.map ~f:(fun json ->
       Yaml.to_string_exn json
       |> Utils.File.write_file
            ( Filename.basename file_path |> Filename.chop_extension
            |> fun base_name -> base_name ^ "-output.json" ))
|> ignore *)
(* let keys = *)
(*   Yaml.to_json yaml |> Result.map ~f:(fun json -> Yaml.Util.keys json) *)
(* in *)
(* Result.map keys ~f:(fun keys -> *)
(*     Result.map keys ~f:(fun keys -> *)
(*         List.iter keys ~f:(fun key -> print_endline ("Key: " ^ key)))) *)
(* |> ignore *)
