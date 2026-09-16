open Base
open Utils

module T = struct
  module T_ = struct
    type t = int Pos.t list [@@deriving equal, compare, sexp]

    let show a =
      List.map a ~f:(fun a -> Pos.value a |> Int.to_string)
      |> String.concat ~sep:" . "

    let pp ppf module_id = Stdlib.Format.fprintf ppf "%s" (show module_id)
  end

  include T_
  include Comparable.Make (T_)
end

include T

let is_parent module_a module_b =
  let module_a_sz = List.length module_a in
  let module_b_sz = List.length module_b in
  if Int.( < ) module_b_sz module_a_sz then false
  else
    let prefix = List.take module_b module_a_sz in
    T_.equal module_a prefix

let empty = []

let root = [Pos.mk ~pos:Pos.dummy 0]

let is_root module_ = equal module_ root

let append module_ id = module_ @ [id]

let to_list module_ = module_
