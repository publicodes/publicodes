open Core

module T = struct
  type t = string list [@@deriving sexp, compare, show]

  let hash = Hashtbl.hash
end

include T

module Set = struct
  module M = Set.Make (T)
  include M
end

module Hashtbl = struct
  module M = Hashtbl.Make (T)
  include M
end
