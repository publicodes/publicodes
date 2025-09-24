include Ast
include Utils

let to_yaml ~(filename : string) (content : string) : yaml Output.t =
  Parse.parse filename content

let to_json  = To_json.to_json
