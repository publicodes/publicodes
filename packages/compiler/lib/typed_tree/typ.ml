open Base
open Utils
open Utils.Output
open Shared
module Any = Utils.Uid.Make ()

type naked_t =
  | Literal of Typ.literal
  | Number of Number_unit.t
  | Symbol of string
  | Enum of string Pos.t list
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
  | Enum values ->
      let values =
        List.map values ~f:Utils.Pos.value
        |> List.map ~f:(Stdlib.Format.asprintf "'%s'")
      in
      let value = String.concat ~sep:", " values in
      Stdlib.Format.asprintf "[%s]" value
  | _ ->
      "?"

let mk ~pos typ = Pos.mk typ ~pos |> UnionFind.make

let any ~pos () = mk ~pos (Any (Any.mk ()))

let literal ~pos typ = mk ~pos (Literal typ)

let symbol ~pos value = mk ~pos (Symbol value)

let number_with_unit ~pos unit = mk ~pos (Number (Number_unit.concrete unit))

let any_number ~pos () = mk ~pos (Number (Number_unit.any ()))

(* Returns all l2 values not fiting in l1 *)
let not_fiting_in l1 l2 =
  List.filter l2 ~f:(fun v2 ->
      not (List.exists l1 ~f:(fun v1 -> String.equal v1 v2)) )

let%test_unit "fit_in" =
  [%test_eq: string list] (not_fiting_in ["foo"; "bar"] ["foo"]) [] ;
  [%test_eq: string list]
    (not_fiting_in ["foo"; "bar"] ["foo"; "super"])
    ["super"]

let dedup_symbols symbols =
  List.stable_dedup symbols ~compare:(fun v1 v2 ->
      String.compare (Pos.value v1) (Pos.value v2) )

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
  | Enum symbols ->
      let symstr =
        List.map symbols ~f:Pos.value
        |> List.map ~f:(Stdlib.Format.sprintf "'%s'")
        |> String.concat ~sep:", "
      in
      Pos.mk ~pos (Stdlib.Format.sprintf "est l'énum [%s]" symstr)
      :: List.map symbols ~f:(function s, pos ->
          Pos.mk ~pos (Stdlib.Format.sprintf "avec ce symbole '%s'" s) )
  | _ ->
      failwith "Impossible"

let error_typ_mismatch (typ1, pos1) (typ2, pos2) =
  let code, message = Err.type_incoherence in
  fatal_error ~pos:pos1 ~kind:`Type ~code
    ~labels:(to_labels (typ1, pos1) @ to_labels (typ2, pos2))
    message

let error_missing_symbols symbols (typ1, pos1) (typ2, pos2) =
  let code, message = Err.type_missing_symbols symbols in
  fatal_error ~pos:pos1 ~kind:`Type ~code
    ~labels:(to_labels (typ1, pos1) @ to_labels (typ2, pos2))
    message

let unify ?enumerate t1 t2 =
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
      if Typ.equal_literal l1 l2 |> not then
        (* Todo replace with a unique type_error, with the pos of the different arguments *)
        error_typ_mismatch typ1 typ2
      else return t1
  | Symbol s1, Symbol s2 -> (
    match enumerate with
    | Some pos ->
        let e =
          if String.equal s1 s2 then [Pos.mk ~pos:pos1 s1]
          else [Pos.mk ~pos:pos1 s1; Pos.mk ~pos:pos2 s2]
        in
        return (UnionFind.merge (fun _ _ -> Pos.mk ~pos (Enum e)) t1 t2)
    | None ->
        if not (String.equal s1 s2) then error_typ_mismatch typ1 typ2
        else return t1 )
  | Enum e, Symbol s | Symbol s, Enum e -> (
    match enumerate with
    | Some pos ->
        let enum =
          if
            let is_enum_first =
              Pos.value typ1 |> function Enum _ -> true | _ -> false
            in
            is_enum_first
          then e @ [Pos.mk ~pos:pos2 s]
          else [Pos.mk ~pos:pos1 s] @ e |> dedup_symbols
        in
        return (UnionFind.merge (fun _ _ -> Pos.mk ~pos (Enum enum)) t1 t2)
    | None ->
        if
          let e = List.map e ~f:Pos.value in
          not (List.exists e ~f:(String.equal s))
        then error_missing_symbols [s] typ1 typ2
        else return t2 )
  | Enum e1, Enum e2 -> (
    match enumerate with
    | Some pos ->
        let enum = dedup_symbols (e1 @ e2) in
        return (UnionFind.merge (fun _ _ -> Pos.mk ~pos (Enum enum)) t1 t2)
    | None ->
        let extra_symbols =
          let e1 = List.map e1 ~f:Pos.value in
          let e2 = List.map e2 ~f:Pos.value in
          not_fiting_in e1 e2
        in
        if List.length extra_symbols = 0 then return t1
        else error_missing_symbols extra_symbols typ1 typ2 )
  | Number n1, Number n2 ->
      let* _ = Number_unit.unify ~pos1 ~pos2 n1 n2 in
      return t1
  | _, _ ->
      error_typ_mismatch typ1 typ2

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
  | Enum value ->
      Some (Shared.Typ.Enum value)
  | Any _ ->
      None
