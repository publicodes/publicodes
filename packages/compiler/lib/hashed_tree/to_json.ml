open Base
open Utils
open Shared
open Tree

(*
 * JSON serialization with flat array construction and ref inlining:
 * 1. Build a flat array of nodes where each node has a unique index
 * 2. Parent nodes reference children by index, not by nested structure
 * 3. Refs are inlined - no separate ref nodes, direct index references instead
 * 4. Hash-based memoization prevents duplicate nodes for same values
 *)

type indexing_state =
  { mutable counter: int
  ; hash_to_index: int Base.Hashtbl.M(To_hash).t
  ; mutable nodes: (int * Yojson.Safe.t) list }

let create_indexing_state () =
  {counter= 0; hash_to_index= Base.Hashtbl.create (module To_hash); nodes= []}

let json_of_eval_tree_flat (tree : Tree.t) =
  let state = create_indexing_state () in
  (* Core indexing: memoized conversion to flat array indices.
   * Returns existing index if hash seen before, else creates new node. *)
  let rec get_or_create_index (value : value) =
    let hash = value.meta.hash in
    match Base.Hashtbl.find state.hash_to_index hash with
    | Some index ->
        index
    | None ->
        let current_index = state.counter in
        state.counter <- state.counter + 1 ;
        Base.Hashtbl.set state.hash_to_index ~key:hash ~data:current_index ;
        let json_content =
          match value.value with
          | Get_context name ->
              `Assoc [("get", `String (Rule_name.to_string name))]
          | Set_context {context; value} ->
              let value_index = get_or_create_index value in
              let context_indices =
                List.fold context ~init:[]
                  ~f:(fun acc_context (rule_name, value) ->
                    let value_index = get_or_create_index value in
                    (Rule_name.to_string (Pos.value rule_name), `Int value_index)
                    :: acc_context )
              in
              `Assoc
                [ ("value", `Int value_index)
                ; ("context", `Assoc (List.rev context_indices)) ]
          | Const c -> (
            match c with
            | Number (n, _) ->
                `Float n
            | Bool b ->
                `Bool b
            | String s ->
                `String s
            | Date (Day {day; month; year}) ->
                `Assoc
                  [ ( "date"
                    , `String (Printf.sprintf "%d-%02d-%02d" year month day) )
                  ]
            | Date (Month {month; year}) ->
                `Assoc
                  [("date", `String (Printf.sprintf "%02d-%02d" year month))]
            | Undefined ->
                `List []
            | Null ->
                `Null )
          | Condition (cond, then_expr, else_expr) ->
              let cond_index = get_or_create_index cond in
              let then_index = get_or_create_index then_expr in
              let else_index = get_or_create_index else_expr in
              `List [`Int cond_index; `Int then_index; `Int else_index]
          | Binary_op ((op, _), left, right) ->
              let left_index = get_or_create_index left in
              let right_index = get_or_create_index right in
              let op_str = Shared.Shared_ast.binary_op_to_string op in
              `List [`String op_str; `Int left_index; `Int right_index]
          | Unary_op ((op, _), expr) ->
              let expr_index = get_or_create_index expr in
              let op_str = match op with Neg -> "-" | Is_undef -> "∅" in
              `List [`String op_str; `Int expr_index]
          | Round (rounding, precision, expr) ->
              let expr_index = get_or_create_index expr in
              let precision_index = get_or_create_index precision in
              let rounding =
                match rounding with
                | Up ->
                    "up"
                | Down ->
                    "down"
                | Nearest ->
                    "~"
              in
              `List
                [ `String "round"
                ; `String rounding
                ; `Int precision_index
                ; `Int expr_index ]
          | Ref rule ->
              let ref_rule_index =
                get_or_create_index (Base.Hashtbl.find_exn tree rule)
              in
              `Assoc
                [ ("ref", `String (Rule_name.to_string rule))
                ; ("node", `Int ref_rule_index) ]
        in
        state.nodes <- (current_index, json_content) :: state.nodes ;
        current_index
  in
  let rule_to_index =
    Base.Hashtbl.fold tree ~init:[] ~f:(fun ~key:rule ~data acc_rules ->
        let index = get_or_create_index data in
        (Rule_name.to_string rule, index) :: acc_rules )
  in
  let sorted_nodes =
    List.sort state.nodes ~compare:(fun (i1, _) (i2, _) -> Int.compare i1 i2)
  in
  let nodes_array = Array.of_list (List.map sorted_nodes ~f:snd) in
  (nodes_array, rule_to_index)

let to_json ~eval_tree ~outputs =
  let nodes_array, rule_to_index = json_of_eval_tree_flat eval_tree in
  let outputs =
    Outputs_to_json.outputs_to_json outputs
    |> List.map ~f:(fun (rule_str, assoc) ->
           let node_index =
             `Int
               (List.Assoc.find_exn rule_to_index rule_str ~equal:String.equal)
           in
           match assoc with
           | `Assoc lst ->
               (rule_str, `Assoc (("nodeIndex", node_index) :: lst))
           | _ ->
               failwith "Expected assoc in output"
           (* Add node index to output metadata *) )
  in
  `Assoc
    [ ("evaluation", `List (Array.to_list nodes_array))
    ; ("outputs", `Assoc outputs) ]
