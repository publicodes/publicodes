let () =
  match Sys.argv with
  | [| _; file_path |] -> (
      let open Compiler in
      let open Core in
      print_endline ("Reading file: " ^ file_path);
      match Yaml_parser.parse_yaml file_path with
      | Ok yaml -> (
          print_endline "Successfully parsed YAML file";
          match Parser.parse yaml with
          | Ok program -> Format.printf "program: %a" Ast.pp_program program
          | Error _err ->
              print_endline "Error printing";
              exit 1)
      | Error _ ->
          print_endline "Failed to parse YAML file";
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
