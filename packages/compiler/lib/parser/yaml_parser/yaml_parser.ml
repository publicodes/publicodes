include Ast
include Utils

let to_yaml ~(file : File.t) (content : string) : yaml Output.t =
  Parse.parse file content

let to_json = To_json.to_json
