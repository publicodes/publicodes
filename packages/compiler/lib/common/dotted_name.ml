open Core

module T = struct
  type t = string list [@@deriving sexp, compare]

  let pp ppf dotted_name =
    Format.fprintf ppf "%s" (String.concat ~sep:" . " dotted_name)

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

(* Get the immediate parent of a dotted name *)
let parent = function
  | [] ->
      None
  | [_] ->
      None
  | dotted_name ->
      Some (List.sub ~pos:0 ~len:(List.length dotted_name - 1) dotted_name)

(* Get all the parent of a dotted name *)
let parents dotted_name =
  List.fold
    ~f:(fun (acc, parents) rule ->
      let current = acc @ [rule] in
      (current, current :: parents) )
    ~init:([], []) dotted_name
  |> snd
