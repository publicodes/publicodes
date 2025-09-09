open Base
open Utils
open Utils.Output
open Shared
module Any = Utils.Uid.Make ()
open UnionFind

type naked_t = Concrete of Units.t | Variable of Any.t | Inv of t | Elem of t

and t = naked_t elem list

type normalized_t =
  { concrete: Units.t (* Only Concrete when normalized *)
  ; elem: naked_t elem list (* Only any when normalized *)
  ; inv: naked_t elem list (* Only any when normalized *) }

let is_concrete = function {elem= []; inv= []; _} -> true | _ -> false

let concrete (unit : Units.t) = [make (Concrete unit)]

let rec normalize (list : t) =
  let normalized =
    List.fold list
      ~f:(fun acc elem ->
        match UnionFind.get elem with
        | Elem elem ->
            let {concrete; elem; inv} = normalize elem in
            { concrete= Units.mul concrete acc.concrete
            ; elem= elem @ acc.elem
            ; inv= inv @ acc.inv }
        | Inv inv ->
            let {concrete; elem; inv} = normalize inv in
            { concrete= Units.mul (Units.inv concrete) acc.concrete
            ; elem= inv @ acc.elem
            ; inv= elem @ acc.inv }
        | Concrete c ->
            {acc with concrete= Units.mul acc.concrete c}
        | Variable _ ->
            {acc with elem= elem :: acc.elem} )
      ~init:{concrete= Units.empty; elem= []; inv= []}
  in
  (* Remove if an element is both in elem and inv *)
  let elem_without_inv =
    List.filter
      ~f:(fun x -> not (List.exists ~f:(UnionFind.eq x) normalized.inv))
      normalized.elem
  in
  let inv_without_elem =
    List.filter
      ~f:(fun x -> not (List.exists ~f:(UnionFind.eq x) normalized.elem))
      normalized.inv
  in
  let simplified_concrete = Units.simplify normalized.concrete in
  {concrete= simplified_concrete; elem= elem_without_inv; inv= inv_without_elem}

let multiply (t1 : t) (t2 : t) : t =
  (* Flatten the lists and concatenate them *)
  t1 @ t2

let divide (t1 : t) (t2 : t) : t =
  (* Flatten the lists and concatenate them *)
  let t2 = UnionFind.make (Inv t2) in
  t2 :: t1

let any () = [make (Variable (Any.mk ()))]

let unify ~pos1 ~pos2 (u1 : t) (u2 : t) =
  let n1 = normalize u1 in
  let n2 = normalize u2 in
  match (n1, n2) with
  | ( {concrete= concrete1; elem= []; inv= []}
    , {concrete= concrete2; elem= []; inv= []} ) ->
      (* The units have different classes, they cannot be converted to each other *)
      if Units.equal concrete1 concrete2 |> not then
        let code, message = Err.type_unit_incoherence in
        fatal_error ~pos:pos1 ~kind:`Type ~code
          ~labels:
            [ Pos.mk ~pos:pos1 (Stdlib.Format.asprintf "unité: %a" Units.pp concrete1)
            ; Pos.mk ~pos:pos2 (Stdlib.Format.asprintf "unité: %a" Units.pp concrete2)
            ]
          message
      else return ()
  | {concrete= a; elem= [elem]; inv= []}, {concrete= b; elem= []; inv= []}
  | {concrete= b; elem= []; inv= []}, {concrete= a; elem= [elem]; inv= []}
  | {concrete= b; elem= []; inv= [elem]}, {concrete= a; elem= []; inv= []}
  | {concrete= a; elem= []; inv= []}, {concrete= b; elem= []; inv= [elem]} ->
      let elem_unit = Units.mul b (Units.inv a) in
      if Units.equal elem_unit Units.empty then
        (* We cannot do anything, as an infered empty unit might still be a percentage *)
        return ()
      else
        let _ =
          UnionFind.merge
            (fun _ b_val -> b_val)
            elem
            (UnionFind.make (Concrete elem_unit))
        in
        return ()
  | {concrete= a; elem= [elem1]; inv= []}, {concrete= b; elem= [elem2]; inv= []}
  | {concrete= a; elem= []; inv= [elem1]}, {concrete= b; elem= []; inv= [elem2]}
    ->
      if Units.equal a b then
        let _ = UnionFind.union elem1 elem2 in
        return ()
      else return ()
  | _ ->
      (* We could maybe handle additional case for a better unit inference system, but this one is good enough right now *)
      return ()

let to_string t =
  let get_variable_name elem =
    match UnionFind.get elem with Variable v -> "u" ^ Any.show v | _ -> "?"
  in
  match normalize t with
  | {concrete; elem= []; inv= []} ->
      Stdlib.Format.asprintf "%a" Units.pp concrete
  | {concrete; elem; inv} -> (
      let parts = [] in
      let parts =
        if not (Units.equal concrete Units.empty) then
          Stdlib.Format.asprintf "%a" Units.pp concrete :: parts
        else parts
      in
      let parts =
        List.fold elem ~init:parts ~f:(fun acc elem ->
            get_variable_name elem :: acc )
      in
      let parts =
        List.fold inv ~init:parts ~f:(fun acc elem ->
            ("/" ^ get_variable_name elem) :: acc )
      in
      match List.rev parts with
      | [] ->
          "1"
      | parts ->
          String.concat ~sep:"." parts )
