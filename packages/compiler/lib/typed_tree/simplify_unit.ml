open Base
open Typ
open Shared
open Utils
open Output

let convert ~pos expr from_unit to_unit =
  let percent_pow_from = Map.find from_unit "%" |> Option.value ~default:0 in
  let percent_pow_to = Map.find to_unit "%" |> Option.value ~default:0 in
  let mk node = Tree.mk ~pos ~typ:(number_with_unit ~pos Units.empty) node in
  Tree.mk ~pos
    ~typ:(number_with_unit ~pos to_unit)
    (Binary_op
       ( Pos.mk ~pos Shared_ast.Mul
       , expr
       , mk
           (Const
              (Number
                 ( 100. **. Float.of_int (percent_pow_to - percent_pow_from)
                 , None ) ) ) ) )
(* TODO : step 1 - normalize every unit. If some are undetermined, default to empty, and print a warning *)

(**Simplify percentage units at the right place in the tree

See the spec here : https://github.com/publicodes/publicodes/discussions/559

This may not be the most elegant solution, but I find it simple enough :

1. Get the normalized, simplified unit of the value
2. If the expression is mul or div, recompute the derived unit
3. If it's different from the normalized unit, it means a simplification takes place here
4. Compute the conversion factor and insert it statically

Note : this will not work if the user assign a unit to a one that would have been simplified by the algo (for instance %.% or €.%)
@TODO : we shouldn't allow user to specify unit that are not simplified (for instance %.% or €/% )
*)

let simplify_value ({pos; meta= typ; value} as expr : Tree.value) : Tree.value =
  match value with
  | Binary_op (((Shared_ast.Mul as op), _), right, left)
  | Binary_op (((Shared_ast.Div as op), _), right, left) ->
      let new_expr =
        let* unit = get_unit typ in
        let* right_unit = get_unit right.meta in
        let* left_unit = get_unit left.meta in
        let open Units in
        let op_unit =
          match op with
          | Shared_ast.Mul ->
              mul right_unit left_unit
          | Shared_ast.Div ->
              mul right_unit (inv left_unit)
          | _ ->
              failwith "Unexpected operator"
        in
        if not (equal op_unit unit) then return (convert ~pos expr op_unit unit)
        else return expr
      in
      new_expr |> Output.value ~default:expr
  | _ ->
      expr
