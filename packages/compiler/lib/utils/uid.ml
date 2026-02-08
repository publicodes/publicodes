open Base

module type S = sig
  type t [@@deriving equal, show]

  val mk : unit -> t

  val to_string : t -> string
end

module Make () : S = struct
  type t = int [@@deriving equal, show]

  let current = ref 0

  let mk () =
    let id = !current in
    current := id + 1 ;
    id

  let to_string (id : t) : string = Int.to_string id
end
