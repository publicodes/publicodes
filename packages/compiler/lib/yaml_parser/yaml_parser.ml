include Ast
include Utils

let parse (filename : string) (content : string) : (yaml, string) result =
  (* Utility function to convert mark to position *)
  (* Allow to use let%bind *)
  match Parse.parse filename content with
  | Ok result -> Ok result
  | Error err -> Error (Format.asprintf "%a" Log.pp err)
