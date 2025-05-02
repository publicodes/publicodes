open Core

type pos = {file: string; start_pos: int * int; end_pos: int * int}
[@@deriving show, sexp, compare]

type 'a t = 'a * pos [@@deriving show, sexp, compare]

let dummy = {file= ""; start_pos= (0, 0); end_pos= (0, 0)}

let beginning_of_file file = {file; start_pos= (1, 1); end_pos= (1, 1)}

(* Map operation *)
let map ~f (x, pos) = (f x, pos)

let ( >>| ) m f = map ~f m

(* Applicative syntax *)
let ( let+ ) m f = map ~f m

(* Utility functions *)
let value (x, _) = x

let mk pos x = (x, pos)
