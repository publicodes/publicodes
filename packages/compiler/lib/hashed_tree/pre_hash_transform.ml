open Shared
open Utils
open Shared.Shared_ast
open Shared.Eval_tree

(* Normalization and implementations that depends on the type infered.
  these transformation must occur after type checking.


  Note: Ideally, we would use a different AST representation,
  but this would complicate the codebase. If it appears that the AST are too different, consider refactoring this to a new pass.

  *)

let rec pre_hash_transform (value : Typed_tree.value) : Typed_tree.value =
  match value.value with
  | Round (rounding, precision, value) ->
      { value with
        value= Round (rounding, normalize_rounding_precision precision, value)
      }
  | _ ->
      value

(* Normalize rounding precision parameter.
This function normalizes
   different precision representations into a standard format where precision is a number.

   Supported precision types:
   - Boolean: true becomes 1, false becomes null
   - Number with "décimales" unit: converted to 10^(-precision)
   - Other numeric types: passed through unchanged
 *)
and normalize_rounding_precision (precision : Typed_tree.value) =
  let typ = Typed_tree.Typ.to_concrete precision.meta in
  let pos = precision.pos in
  let p =
    Typed_tree.mk ~pos ~typ:(Typed_tree.Typ.number_with_unit ~pos Units.empty)
  in
  match typ with
  (* Case 1: precision is BOOLEAN *)
  | Some (Typ.Literal Typ.Bool) ->
      (*if precision then precision = 1 else precision = Non applicable *)
      p (Condition (precision, p (Const (Number (1., None))), p (Const Null)))
  | Some (Typ.Number (Some unit)) ->
      if
        (* Case 2: precision is in « décimales » *)
        Units.equal unit (Units.parse_unit "décimales")
      then
        (* precision = 10 ^ -precision *)
        p
          (Binary_op
             ( Pos.mk ~pos Pow
             , p (Const (Number (10., None)))
             , p (Unary_op (Pos.mk ~pos Neg, precision)) ) )
      else precision
  | _ ->
      (* Case 3: precision is in number *)
      precision
