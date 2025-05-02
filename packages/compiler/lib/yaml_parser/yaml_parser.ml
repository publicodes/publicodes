include Ast
include Utils

let parse ~(filename : string) (content : string) : yaml Output.t =
  Parse.parse filename content
