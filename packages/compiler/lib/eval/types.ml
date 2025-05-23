open Core
open Utils
open Utils.Output
open Shared
module Any = Utils.Uid.Make ()

type literal = String | Bool | Date [@@deriving sexp, compare, show]

module Unit = struct
  module Any = Utils.Uid.Make ()
  open UnionFind

  type naked_t =
    | Concrete of Units.t
    | Variable of Any.t
    | Inv of t
    | Elem of t

  and t = naked_t elem list

  type normalized_t =
    { concrete: Units.t (* Only Concrete when normalized *)
    ; elem: naked_t elem list (* Only any when normalized *)
    ; inv: naked_t elem list (* Only any when normalized *) }

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
    {normalized with elem= elem_without_inv; inv= inv_without_elem}

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
        if [%compare.equal: Units.t] concrete1 concrete2 |> not then
          (* Todo replace with a unique type_error, with the pos of the different arguments *)
          let code, message = Err.type_unit_incoherence in
          fatal_error ~pos:pos1 ~kind:`Type ~code
            ~labels:
              [ Pos.mk ~pos:pos1 (Format.asprintf "unité: %a" Units.pp concrete1)
              ; Pos.mk ~pos:pos2
                  (Format.asprintf "unité: %a" Units.pp concrete2) ]
            message
        else return ()
    | {concrete= a; elem= [elem]; inv= []}, {concrete= b; elem= elems; inv= []}
    | {concrete= b; elem= elems; inv= []}, {concrete= a; elem= [elem]; inv= []}
      ->
        let _ =
          UnionFind.merge
            (fun _ b_val -> b_val)
            elem
            (UnionFind.make
               (Elem
                  ( UnionFind.make (Concrete (Units.mul b (Units.inv a)))
                  :: elems ) ) )
        in
        return ()
    | {concrete= a; elem= []; inv= [elem]}, {concrete= b; elem= []; inv= []}
    | {concrete= b; elem= []; inv= []}, {concrete= a; elem= []; inv= [elem]} ->
        let _ =
          UnionFind.merge
            (fun _ b_val -> b_val)
            elem
            (UnionFind.make (Concrete (Units.mul a (Units.inv b))))
        in
        return ()
    | _, _ ->
        (* We could handle additional case for a better unit inference system, but this one is good enough right now *)
        return ()
end

type naked_t = Literal of literal | Number of Unit.t | Any of Any.t

and t = naked_t Pos.t UnionFind.elem

let mk ~pos (typ : naked_t) : t = Pos.mk typ ~pos |> UnionFind.make

let any ~pos () : t = mk ~pos (Any (Any.mk ()))

let literal ~pos typ : t = mk ~pos (Literal typ)

let number_with_unit ~pos (unit : Units.t) : t =
  mk ~pos (Number (Unit.concrete unit))

let any_number ~pos () : t = mk ~pos (Number (Unit.any ()))

let to_str = function
  | Number _ ->
      "un nombre "
  | Literal String ->
      "un texte"
  | Literal Bool ->
      "un booléen (oui / non)"
  | Literal Date ->
      "une date"
  | _ ->
      "whatev"

let unify (t1 : t) (t2 : t) =
  let typ1 = t1 |> UnionFind.get in
  let typ2 = t2 |> UnionFind.get in
  let pos1 = Pos.pos typ1 in
  let pos2 = Pos.pos typ2 in
  let error_typ_mismatch () =
    let code, message = Err.type_incoherence in
    fatal_error ~pos:pos1 ~kind:`Type ~code
      ~labels:
        [ Pos.mk ~pos:pos1 (Format.sprintf "est %s" (to_str (Pos.value typ1)))
        ; Pos.mk ~pos:pos2 (Format.sprintf "est %s" (to_str (Pos.value typ2)))
        ]
      message
  in
  match (Pos.value typ1, Pos.value typ2) with
  | Any _, Any _ ->
      return (UnionFind.union t1 t2)
  | Any _, _ ->
      return (UnionFind.merge (fun _ b -> b) t1 t2)
  | _, Any _ ->
      return (UnionFind.merge (fun a _ -> a) t1 t2)
  | Literal l1, Literal l2 ->
      if [%compare.equal: literal] l1 l2 |> not then
        (* Todo replace with a unique type_error, with the pos of the different arguments *)
        error_typ_mismatch ()
      else return t1
  | Number _, Literal _ | Literal _, Number _ ->
      error_typ_mismatch ()
  | Number n1, Number n2 ->
      let* _ = Unit.unify ~pos1 ~pos2 n1 n2 in
      return t1

let multiply ~pos n1 n2 =
  let typ1 = n1 |> UnionFind.get in
  let typ2 = n2 |> UnionFind.get in
  match (Pos.value typ1, Pos.value typ2) with
  | Number n1, Number n2 ->
      mk ~pos (Number (Unit.multiply n1 n2))
  | _, _ ->
      failwith "Can't multiply"

let divide ~pos n1 n2 =
  let typ1 = n1 |> UnionFind.get in
  let typ2 = n2 |> UnionFind.get in
  match (Pos.value typ1, Pos.value typ2) with
  | Number n1, Number n2 ->
      mk ~pos (Number (Unit.divide n1 n2))
  | _, _ ->
      failwith "Can't divide"
