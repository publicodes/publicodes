open Core

type pos = { file : string; line : int * int; col : int * int }
[@@deriving show, sexp, compare]

type 'a t = 'a * pos [@@deriving show, sexp, compare]

let dummy_pos = { file = ""; line = (0, 0); col = (0, 0) }

(* Map operation *)
let map f (x, pos) = (f x, pos)
let ( >>| ) m f = map f m

(* Applicative syntax *)
let ( let+ ) m f = map f m

(* Utility functions *)
let without (x, _) = x
let mk pos x = (x, pos)
