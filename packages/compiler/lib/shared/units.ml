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
  let positive_units, negative_units =
    unit |> map_to_list |> List.partition_tf ~f:(fun (_, power) -> power > 0)
  in
  let format_unit (unit_name, power) =
    let abs_power = abs power in
    if abs_power = 1 then unit_name
    else unit_name ^ "^" ^ Int.to_string abs_power
  in
  let positive_str =
    positive_units |> List.map ~f:format_unit |> String.concat ~sep:"."
  in
  let negative_str =
    negative_units |> List.map ~f:format_unit |> String.concat ~sep:"."
  in
  let units_str =
    match (positive_str, negative_str) with
    | "", "" ->
        ""
    | pos, "" ->
        pos
    | "", neg ->
        "/" ^ neg
    | pos, neg ->
        pos ^ "/" ^ neg
  in
  Format.fprintf formatter "%s" units_str

let parse_unit (unit : string) : t =
  let unit_blk = unit |> String.split ~on:'/' |> List.map ~f:trim in
  let num, denoms =
    match unit_blk with
    | [] ->
        raise (Invalid_argument "Unit cannot be empty")
    | num :: denom ->
        (num, denom)
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

let equal (unit1 : t) (unit2 : t) : bool = Map.equal Int.equal unit1 unit2

let same_class (unit1 : t) (unit2 : t) : bool =
  (* Remove '%' unit in both and compare *)
  let unit1 = Map.remove unit1 "%" in
  let unit2 = Map.remove unit2 "%" in
  equal unit1 unit2

let mul (t1 : t) (t2 : t) : t =
  let new_map =
    Map.fold t2 ~init:t1 ~f:(fun ~key ~data acc ->
        Map.update acc key ~f:(function Some n -> n + data | None -> data) )
  in
  (* Step to remove 0 *)
  Map.filter new_map ~f:(fun power -> power <> 0)

let inv (t1 : t) : t = Map.map t1 ~f:(fun power -> -power)

let empty = StrMap.empty

(** Simplify unit *)
let simplify number_unit =
  let percent_pow = Map.find number_unit "%" |> Option.value ~default:0 in
  let percent_is_only_unit_in_numerator =
    Map.existsi number_unit ~f:(fun ~key ~data ->
        String.( <> ) key "%" && data > 0 )
    |> not
  in
  match (percent_pow, percent_is_only_unit_in_numerator) with
  | 0, _ ->
      number_unit
  | n, true when n > 0 ->
      Map.set number_unit ~key:"%" ~data:1
  | _ ->
      Map.remove number_unit "%"
