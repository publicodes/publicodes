let trim = String.trim

open Core

module StrMap = struct
  module M = Map.Make (String)
  include M
end

type t = int StrMap.t [@@deriving sexp, compare]

let pp formatter unit =
  let map_to_list map =
    Map.to_alist map
    |> List.sort ~compare:(fun (_, a) (_, b) -> Int.compare b a)
  in
  let to_string (unit_name, power) =
    if power = 1 then unit_name
    else if power > 1 then unit_name ^ "^" ^ Int.to_string power
    else if power = -1 then "/" ^ unit_name
    else "/" ^ unit_name ^ "^" ^ Int.to_string (abs power)
  in
  let units_str =
    unit |> map_to_list |> List.map ~f:to_string |> String.concat ~sep:"."
  in
  Format.fprintf formatter "%s" units_str

let parse_unit (unit : string) : t =
  let unit_blk = unit |> String.split ~on:'/' |> List.map ~f:trim in
  let num, denoms =
    match unit_blk with
    | [] -> raise (Invalid_argument "Unit cannot be empty")
    | num :: denom -> (num, denom)
  in

  let num = num |> String.split ~on:'.' |> List.map ~f:trim in
  let denom =
    denoms |> List.concat_map ~f:(String.split ~on:'.') |> List.map ~f:trim
  in
  num
  |> List.fold ~init:StrMap.empty
       ~f:(Map.update ~f:(function Some n -> n + 1 | None -> 1))
  |> fun acc ->
  List.fold ~init:acc
    ~f:(Map.update ~f:(function Some n -> n - 1 | None -> -1))
    denom
