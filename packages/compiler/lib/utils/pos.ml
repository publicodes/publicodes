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

let mk pos x = (x, pos)

let beginning_of_file file = {file; start_pos= (1, 1); end_pos= (1, 1)}

let dummy = {file= ""; start_pos= (0, 0); end_pos= (0, 0)}
