open Base

module Make () = struct
  type t = int [@@deriving equal, show]

  let current = ref 0

  let mk () =
    let id = !current in
    current := id + 1 ;
    id
end
