open Core

module Make () = struct
  type t = int [@@deriving sexp, show, compare]

  let current = ref 0

  let mk () =
    let id = !current in
    current := id + 1 ;
    id
end
