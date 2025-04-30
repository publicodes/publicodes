let parse raw_content =
  (* let raw_content = Utils.File.read_file file_path in *)
  let result = Yaml.yaml_of_string raw_content in
  match result with Ok yaml -> Ok yaml | Error (`Msg msg) -> Error msg

let print yaml =
  match Yaml.yaml_to_string ~encoding:`Utf8 yaml with
  | Ok yaml_string -> Printf.printf "%s\n" yaml_string
  | Error _ -> print_endline "Failed to convert YAML to string"
