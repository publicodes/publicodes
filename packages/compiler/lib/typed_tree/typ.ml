open Base
open Utils
open Utils.Output
open Shared
module Any = Utils.Uid.Make ()

type naked_t = Literal of Typ.literal | Number of Number_unit.t | Any of Any.t

and t = naked_t Pos.t UnionFind.elem

let to_string t =
  let typ, _ = UnionFind.get t in
  match typ with
  | Number u ->
      "num " ^ Number_unit.to_string u
  | Literal String ->
      "text"
  | Literal Bool ->
      "bool"
  | Literal Date ->
      "date"
  | _ ->
      "?"

let mk ~pos typ = Pos.mk typ ~pos |> UnionFind.make

let any ~pos () = mk ~pos (Any (Any.mk ()))

let literal ~pos typ = mk ~pos (Literal typ)

let number_with_unit ~pos unit = mk ~pos (Number (Number_unit.concrete unit))

let any_number ~pos () = mk ~pos (Number (Number_unit.any ()))

let error_typ_mismatch (typ1, pos1) (typ2, pos2) =
  let to_str = function
    | Number _ ->
        "un nombre"
    | Literal String ->
        "un texte"
    | Literal Bool ->
        "un booléen (oui / non)"
    | Literal Date ->
        "une date"
    | _ ->
        failwith "Impossible"
  in
  let code, message = Err.type_incoherence in
  fatal_error ~pos:pos1 ~kind:`Type ~code
    ~labels:
      [ Pos.mk ~pos:pos1 (Stdlib.Format.sprintf "est %s" (to_str typ1))
      ; Pos.mk ~pos:pos2 (Stdlib.Format.sprintf "est %s" (to_str typ2)) ]
    message

let unify t1 t2 =
  let typ1 = UnionFind.get t1 in
  let typ2 = UnionFind.get t2 in
  let pos1 = Pos.pos typ1 in
  let pos2 = Pos.pos typ2 in
  match (Pos.value typ1, Pos.value typ2) with
  | Any _, Any _ ->
      return (UnionFind.union t1 t2)
  | Any _, _ ->
      return (UnionFind.merge (fun _ b -> b) t1 t2)
  | _, Any _ ->
      return (UnionFind.merge (fun a _ -> a) t1 t2)
  | Literal l1, Literal l2 ->
      if Typ.equal_literal l1 l2 then return t1
      else
        (* Todo replace with a unique type_error, with the pos of the different arguments *)
        error_typ_mismatch typ1 typ2
  | Number _, Literal _ | Literal _, Number _ ->
      error_typ_mismatch typ1 typ2
  | Number unit1, Number unit2 ->
      let* _ = Number_unit.unify ~pos1 ~pos2 unit1 unit2 in
      return t1

let multiply ~pos n1 n2 =
  let typ1 = UnionFind.get n1 in
  let typ2 = UnionFind.get n2 in
  match (Pos.value typ1, Pos.value typ2) with
  | Number unit1, Number unit2 ->
      mk ~pos (Number (Number_unit.multiply unit1 unit2))
  | _, _ ->
      failwith "Can't multiply"

let divide ~pos n1 n2 =
  let typ1 = UnionFind.get n1 in
  let typ2 = UnionFind.get n2 in
  match (Pos.value typ1, Pos.value typ2) with
  | Number n1, Number n2 ->
      mk ~pos (Number (Number_unit.divide n1 n2))
  | _, _ ->
      failwith "Can't divide"

let get_unit elem =
  let typ, _ = UnionFind.get elem in
  match typ with
  | Number unit ->
      let unit = Number_unit.normalize unit in
      (* If not a concrete unit, exit *)
      if not (Number_unit.is_concrete unit) then empty else return unit.concrete
  | _ ->
      empty

let to_concrete elem =
  let typ, _ = UnionFind.get elem in
  match typ with
  | Number unit ->
      let unit = Number_unit.normalize unit in
      Some (Shared.Typ.Number (Some unit.concrete))
  | Literal l ->
      Some (Shared.Typ.Literal l)
  | Any _ ->
      None
