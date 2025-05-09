open Core

type t = int [@@deriving sexp, show]

let current = ref 0

let next () =
  let id = !current in
  current := id + 1 ;
  id
