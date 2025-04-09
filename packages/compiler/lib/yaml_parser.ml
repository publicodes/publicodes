let parse_yaml file_path =
  let raw_content = Utils.File.read_file file_path in
  (* let raw_content = Utils.File.read_file file_path in *)
  Yaml.yaml_of_string raw_content

let print_yaml yaml =
  match Yaml.yaml_to_string ~encoding:`Utf8 yaml with
  | Ok yaml_string -> Printf.printf "%s\n" yaml_string
  | Error _ -> print_endline "Failed to convert YAML to string"
