open Core

module T = struct
  type t = string list [@@deriving sexp, compare, equal]

  let pp ppf rule_name =
    Format.fprintf ppf "%s" (String.concat ~sep:" . " rule_name)

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

  let pp pp_val ppf tbl =
    Format.fprintf ppf "@[<hv>@[<hv 2>{" ;
    let first = ref true in
    Core.Hashtbl.iteri tbl ~f:(fun ~key ~data ->
        if not !first then Format.fprintf ppf ";@ " else first := false ;
        Format.fprintf ppf "@[<hv 2>%a :@ %a@]"
          (fun ppf rule_name ->
            Format.fprintf ppf "%s" (String.concat ~sep:" . " rule_name) )
          key pp_val data ) ;
    Format.fprintf ppf "@]@ }@]"
end

let create_exn (ref : string list) : t =
  match ref with
  | [] ->
      raise (Invalid_argument "Rule name cannot be empty")
  | _ :: _ ->
      ref

(* Get the immediate parent of a dotted name *)
let parent = function
  | [] ->
      None
  | [_] ->
      None
  | rule_name ->
      Some (List.sub ~pos:0 ~len:(List.length rule_name - 1) rule_name)

(* Get all the parent of a dotted name *)
let parents rule_name =
  List.fold
    ~f:(fun (acc, parents) rule ->
      let current = acc @ [rule] in
      (current, current :: parents) )
    ~init:([], []) rule_name
  |> snd

let to_string rule_name = String.concat ~sep:" . " rule_name

let resolve ~rule_names ~current (name : string list) =
  let parent_paths = parents current @ [[]] in
  let matched_rule =
    List.find_map parent_paths ~f:(fun parent ->
        let rule = parent @ name in
        (* We dont want to match the current rule if there is a matching parent rule *)
        if List.equal String.equal rule current then None
        else if Core.Set.mem rule_names rule then Some rule
        else None )
  in
  match matched_rule with
  | Some x ->
      Some x
  (* If no matching, we check if the current rule is a match *)
  | None ->
      (* Debug: *)
      (* Printf.printf "Debug: current rule = %s\n" (to_string current) ;
      Printf.printf "Debug: name = %s\n" (to_string name) ;
      Printf.printf "Debug: list length = %i\n" (List.length name) ; *)
      if String.equal (to_string current) (to_string name) then Some current
      else None
