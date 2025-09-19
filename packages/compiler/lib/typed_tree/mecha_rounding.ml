open Typ
open Shared
open Utils
open Output
open Shared.Shared_ast
open Shared.Eval_tree

let rec normalize_value (value : Tree.value) : Tree.value =
  match value.value with
  | Round (rounding, precision, value) ->
      let precision = normalize_rounding_precision precision in
      {value with value= Round (rounding, precision, value)}
  | _ ->
      value

(* Normalize rounding precision parameter.
This function normalizes
   different precision representations into a standard Stdlib.Format where precision is a number.

   Supported precision types:
   - Boolean: true becomes 1, false becomes null
   - Number with "décimales" unit: converted to 10^(-precision)
   - Other numeric types: passed through unchanged
 *)
and normalize_rounding_precision (precision : Tree.value) =
  let typ = to_concrete precision.meta in
  let pos = precision.pos in
  let p = Tree.mk ~pos ~typ:(number_with_unit ~pos Units.empty) in
  match typ with
  (* Case 1: precision is BOOLEAN *)
  | Some (Literal Bool) ->
      (*if precision then precision = 1 else precision = Non applicable *)
      p (Condition (precision, p (Const (Number (1., None))), p (Const Null)))
  (* Case 2: precision is in « décimales » *)
  | Some (Number (Some unit))
    when Units.equal unit (Units.parse_unit "décimales") ->
      p
        (Binary_op
           ( Pos.mk ~pos Pow
           , p (Const (Number (10., None)))
           , p (Unary_op (Pos.mk ~pos Neg, precision)) ) )
  (* Case 3: precision is in number *)
  | Some (Number _) ->
      precision
  (* Case 4: no type can be infered or wrong type infered, error has been raised in typechecking *)
  | _ ->
      precision

let typecheck ~unify_value ~pos ~typ ~snd_pass (_, precision, value) =
  let* _ = unify_value value in
  let* _ = unify value.meta (any_number ~pos ()) in
  let* _ = unify_value precision in
  let* _ = unify typ value.meta in
  (*
	  We do not unify the precision, because it is polymorphic (boolean, integer with unit `décimales`, or any other unit)
	  But we type_check it once we know its type (second pass)
	*)
  if snd_pass then
    let typ, pos = UnionFind.get precision.meta in
    match typ with
    | Any _ | Literal String | Literal Date ->
        let code, message = Err.type_invalid_type in
        fatal_error ~kind:`Type
          ~hints:["arrondi doit être un nombre ou un booléen"]
          ~pos ~code message
    | Literal Bool ->
        return ()
    | Number unit ->
        if
          (* If unit is « décimales », then everything is good *)
          let open Number_unit in
          let normalized_unit = normalize unit in
          is_concrete normalized_unit
          && Units.equal normalized_unit.concrete (Units.parse_unit "décimales")
        then return ()
        else
          (* Otherwise, we check if the unit is compatible with the value *)
          let* _ = unify value.meta precision.meta in
          return ()
  else return ()
