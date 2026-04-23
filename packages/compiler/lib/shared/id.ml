open Base

let hash (name : Rule_name.t) (pos : Utils.Pos.pos) : string =
  List.map ~f:Int.to_string
    [ pos.start_pos.index
    ; pos.start_pos.line
    ; pos.start_pos.column
    ; pos.end_pos.index
    ; pos.end_pos.line
    ; pos.end_pos.column ]
  |> List.append [Rule_name.show name; pos.file]
  |> String.concat |> Stdlib.Digest.string |> Stdlib.Digest.to_hex
