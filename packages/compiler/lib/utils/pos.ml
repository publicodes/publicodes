open Core

type pos = {file: string; start_pos: int * int; end_pos: int * int}
[@@deriving show, sexp, compare]

type 'a t = 'a * pos [@@deriving show, sexp, compare]

(* Map operation *)
let map ~f (x, pos) = (f x, pos)

let ( >>| ) m f = map ~f m

(* Applicative syntax *)
let ( let+ ) m f = map ~f m

(* Utility functions *)
let value (x, _) = x

let pos (_, pos) = pos

let mk ~pos x = (x, pos)

let beginning_of_file file = {file; start_pos= (1, 1); end_pos= (1, 1)}

let dummy = {file= ""; start_pos= (0, 0); end_pos= (0, 0)}

let merge pos1 pos2 =
  if String.compare pos1.file pos2.file <> 0 then
    raise @@ Invalid_argument "Cannot merge positions from different files"
  else {file= pos1.file; start_pos= pos1.start_pos; end_pos= pos2.end_pos}

let add ?(col = 0) ?(line = 0) pos =
  {pos with end_pos= (fst pos.end_pos + line, snd pos.end_pos + col)}
