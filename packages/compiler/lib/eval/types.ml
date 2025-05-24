open Core
open Utils
open Utils.Output
module Any = Utils.Uid.Make ()

type concrete_type = Number | String | Bool | Date
[@@deriving sexp, compare, show]

type naked_t = Concrete of concrete_type | Any of Any.t

and t = naked_t Pos.t UnionFind.elem

let any ~pos () : t = Any (Any.mk ()) |> Pos.mk ~pos |> UnionFind.make

let concrete ~pos typ : t = Concrete typ |> Pos.mk ~pos |> UnionFind.make

let concrete_to_str = function
  | Number ->
      "un nombre"
  | String ->
      "un texte"
  | Bool ->
      "un booléen (oui / non)"
  | Date ->
      "une date"

let unify (t1 : t) (t2 : t) =
  let typ1 = t1 |> UnionFind.get in
  let typ2 = t2 |> UnionFind.get in
  match (Pos.value typ1, Pos.value typ2) with
  | Any _, Any _ ->
      return (UnionFind.union t1 t2)
  | Any _, Concrete _ ->
      return (UnionFind.merge (fun _ b -> b) t1 t2)
  | Concrete _, Any _ ->
      return (UnionFind.merge (fun a _ -> a) t1 t2)
  | Concrete c1, Concrete c2 ->
      if [%compare.equal: concrete_type] c1 c2 |> not then
        (* Todo replace with a unique type_error, with the pos of the different arguments *)
        let code, message = Err.type_incoherence in
        fatal_error ~pos:(Pos.pos typ1) ~kind:`Type ~code
          ~labels:
            [ Pos.mk ~pos:(Pos.pos typ1)
                (Format.sprintf "est %s" (concrete_to_str c1))
            ; Pos.mk ~pos:(Pos.pos typ2)
                (Format.sprintf "est %s" (concrete_to_str c2)) ]
          message
      else return t1
