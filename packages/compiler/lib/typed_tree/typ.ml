open Base
open Utils
open Utils.Output
open Shared
module Any = Utils.Uid.Make ()

type naked_t =
  | Literal of Typ.literal
  | Number of Number_unit.t
  | Symbol of string
  | Any of Any.t

and t = naked_t Pos.t UnionFind.elem

let to_string t =
  UnionFind.get t |> Pos.value
  |> function
  | Number u ->
      "num " ^ Number_unit.to_string u
  | Literal String ->
      "text"
  | Literal Bool ->
      "bool"
  | Literal Date ->
      "date"
  | Symbol value ->
      Stdlib.Format.asprintf "'%s'" value
  | _ ->
      "?"

let mk ~pos typ = Pos.mk typ ~pos |> UnionFind.make

let any ~pos () = mk ~pos (Any (Any.mk ()))

let literal ~pos typ = mk ~pos (Literal typ)

let symbol ~pos value = mk ~pos (Symbol value)

let number_with_unit ~pos unit = mk ~pos (Number (Number_unit.concrete unit))

let any_number ~pos () = mk ~pos (Number (Number_unit.any ()))

let unify t1 t2 =
  let typ1 = t1 |> UnionFind.get in
  let typ2 = t2 |> UnionFind.get in
  let pos1 = Pos.pos typ1 in
  let pos2 = Pos.pos typ2 in
  let error_typ_mismatch () =
    let to_labels (typ, pos) =
      match typ with
      | Number _ ->
          [Pos.mk ~pos "est un nombre"]
      | Literal String ->
          [Pos.mk ~pos "est un texte"]
      | Literal Bool ->
          [Pos.mk ~pos "est un booléen (oui / non)"]
      | Literal Date ->
          [Pos.mk ~pos "est une date"]
      | Symbol s ->
          [Pos.mk ~pos (Stdlib.Format.sprintf "est le symbole '%s'" s)]
      | _ ->
          failwith "Impossible"
    in
    let code, message = Err.type_incoherence in
    fatal_error ~pos:pos1 ~kind:`Type ~code
      ~labels:(to_labels typ1 @ to_labels typ2)
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
      if Typ.equal_literal l1 l2 |> not then
        (* Todo replace with a unique type_error, with the pos of the different arguments *)
        error_typ_mismatch ()
      else return t1
  | Symbol s1, Symbol s2 ->
      if not (String.equal s1 s2) then error_typ_mismatch () else return t1
  | Number n1, Number n2 ->
      let* _ = Number_unit.unify ~pos1 ~pos2 n1 n2 in
      return t1
  | _, _ ->
      error_typ_mismatch ()

let multiply ~pos n1 n2 =
  let typ1 = n1 |> UnionFind.get in
  let typ2 = n2 |> UnionFind.get in
  match (Pos.value typ1, Pos.value typ2) with
  | Number n1, Number n2 ->
      mk ~pos (Number (Number_unit.multiply n1 n2))
  | _, _ ->
      failwith "Can't multiply"

let divide ~pos n1 n2 =
  let typ1 = n1 |> UnionFind.get in
  let typ2 = n2 |> UnionFind.get in
  match (Pos.value typ1, Pos.value typ2) with
  | Number n1, Number n2 ->
      mk ~pos (Number (Number_unit.divide n1 n2))
  | _, _ ->
      failwith "Can't divide"

let get_unit typ =
  match typ |> UnionFind.get |> Pos.value with
  | Number unit ->
      let unit = Number_unit.normalize unit in
      (* If not a concrete unit, exit *)
      if not (Number_unit.is_concrete unit) then empty else return unit.concrete
  | _ ->
      empty

let to_concrete typ =
  match typ |> UnionFind.get |> Pos.value with
  | Number unit ->
      let unit = Number_unit.normalize unit in
      Some (Shared.Typ.Number (Some unit.concrete))
      (* else Some (Shared.Typ.Number None) *)
  | Literal l ->
      Some (Shared.Typ.Literal l)
  | Symbol value ->
      Some (Shared.Typ.Symbol value)
  | Any _ ->
      None
