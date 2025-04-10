type t = { filename : File.t; starts : int * int; ends : int * int }
[@@deriving show]

(* TODO: maybe we will need to abstract this type in a Mark module at some point *)
type 'a with_loc = 'a * t [@@deriving show]

let make_loc ~filename ?ends ~starts () =
  { filename; starts; ends = ends |> Option.value ~default:starts }

let make_with ~filename ~starts ?ends expr =
  let loc = make_loc ~filename ~starts ?ends () in
  (expr, loc)

let next_line = function
  | expr, ({ ends = line, _; _ } as loc) ->
      (expr, { loc with ends = (line + 1, 0) })

let next_char = function
  | expr, ({ ends = line, col; _ } as loc) ->
      (expr, { loc with ends = (line, col + 1) })
