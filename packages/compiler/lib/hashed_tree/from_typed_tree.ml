open Core
open Shared
open Tree
open To_hash
open Utils
open Shared.Eval_tree

(*
  We do type retrival and add hash to the node in one pass as :
  - They are independent
  - They occurs at the same time
  - We want to avoid traversing the tree twice
*)

let rec transform_to_hash_and_type ({value; meta= typ; pos} : Typed_tree.value)
    : Tree.value =
  let transform_naked_value = function
    | Eval_tree.Const const ->
        let hash = of_constant const in
        (Eval_tree.Const const, hash)
    | Eval_tree.Condition (cond, then_comp, else_comp) ->
        let cond' = transform_to_hash_and_type cond in
        let then_comp' = transform_to_hash_and_type then_comp in
        let else_comp' = transform_to_hash_and_type else_comp in
        let hash =
          combine
            [ hash_string "condition"
            ; cond'.meta.hash
            ; then_comp'.meta.hash
            ; else_comp'.meta.hash ]
        in
        (Eval_tree.Condition (cond', then_comp', else_comp'), hash)
    | Eval_tree.Binary_op (op, left, right) ->
        let left' = transform_to_hash_and_type left in
        let right' = transform_to_hash_and_type right in
        let op_hash = of_binary_op (Pos.value op) in
        let hash =
          combine
            [hash_string "binary_op"; op_hash; left'.meta.hash; right'.meta.hash]
        in
        (Eval_tree.Binary_op (op, left', right'), hash)
    | Eval_tree.Unary_op (op, comp) ->
        let comp' = transform_to_hash_and_type comp in
        let op_hash = of_unary_op (Pos.value op) in
        let hash = combine [hash_string "unary_op"; op_hash; comp'.meta.hash] in
        (Eval_tree.Unary_op (op, comp'), hash)
    | Eval_tree.Ref rule_name ->
        let hash = combine [hash_string "ref"; of_rule_name rule_name] in
        (Eval_tree.Ref rule_name, hash)
    | Eval_tree.Get_context rule_name ->
        let hash =
          combine [hash_string "get_context"; of_rule_name rule_name]
        in
        (Eval_tree.Get_context rule_name, hash)
    | Eval_tree.Set_context {context; value} ->
        let value' = transform_to_hash_and_type value in
        let context' =
          List.map context ~f:(fun (rule_name, comp) ->
              (rule_name, transform_to_hash_and_type comp) )
        in
        let context_hashes =
          List.map context' ~f:(fun (rule_name, comp) ->
              combine [of_rule_name (Pos.value rule_name); comp.meta.hash] )
        in
        let hash =
          combine
            ([hash_string "set_context"; value'.meta.hash] @ context_hashes)
        in
        (Eval_tree.Set_context {context= context'; value= value'}, hash)
  in
  let new_value, hash = transform_naked_value value in
  let typ_concrete = Typed_tree.Typ.to_concrete typ in
  {value= new_value; meta= {typ= typ_concrete; hash}; pos}

let from_typed_tree (tree : Typed_tree.t) : Tree.t =
  Hashtbl.map tree ~f:transform_to_hash_and_type
