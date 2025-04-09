type t = { filename : File.t; col : int; row : int } [@@deriving show]

(* TODO: maybe we will need to abstract this type in a Mark module at some point *)
type 'a with_loc = 'a * t [@@deriving show]

let make_loc ~filename ~col ~row = { filename; col; row }

let make_with ~filename ~col ~row expr =
  let loc = make_loc ~filename ~col ~row in
  (expr, loc)
