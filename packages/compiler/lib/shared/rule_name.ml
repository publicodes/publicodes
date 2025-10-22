open Base

module Rule_name = struct
  module T = struct
    type t = string list [@@deriving equal, compare, sexp]

    let show = String.concat ~sep:" . "

    let pp ppf rule_name = Stdlib.Format.fprintf ppf "%s" (show rule_name)

    let hash = Base.Hashtbl.hash
  end

  include T
  include Comparable.Make (T)
end

include Rule_name

module Set = struct
  module M = Set.M (Rule_name)
  include M
end

module Hashtbl = struct
  module M = Hashtbl.M (Rule_name)
  include M

  let pp pp_val ppf tbl =
    Stdlib.Format.fprintf ppf "@[<hv>@[<hv 2>{" ;
    let first = ref true in
    Base.Hashtbl.iteri tbl ~f:(fun ~key ~data ->
        if not !first then Stdlib.Format.fprintf ppf ";@ " else first := false ;
        Stdlib.Format.fprintf ppf "@[<hv 2>%a :@ %a@]"
          (fun ppf rule_name ->
            Stdlib.Format.fprintf ppf "%s" (String.concat ~sep:" . " rule_name) )
          key pp_val data ) ;
    Stdlib.Format.fprintf ppf "@]@ }@]"
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
        else if Base.Set.mem rule_names rule then Some rule
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
