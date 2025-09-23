open Base
open Utils
open Shared.Eval_tree
open Shared.Rule_name
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
              `Assoc [("get", `String (to_string name))]
          | Set_context {context; value} ->
              let value_index = resolve_and_get_index value in
              let context_indices =
                List.fold context ~init:[]
                  ~f:(fun acc_context (rule_name, value) ->
                    let value_index = resolve_and_get_index value in
                    (to_string (Pos.value rule_name), `Int value_index)
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
              let cond_index = resolve_and_get_index cond in
              let then_index = resolve_and_get_index then_expr in
              let else_index = resolve_and_get_index else_expr in
              `List [`Int cond_index; `Int then_index; `Int else_index]
          | Binary_op ((op, _), left, right) ->
              let left_index = resolve_and_get_index left in
              let right_index = resolve_and_get_index right in
              let op_str = Shared.Shared_ast.binary_op_to_string op in
              `List [`String op_str; `Int left_index; `Int right_index]
          | Unary_op ((op, _), expr) ->
              let expr_index = resolve_and_get_index expr in
              let op_str = match op with Neg -> "-" | Is_undef -> "∅" in
              `List [`String op_str; `Int expr_index]
          | Round (rounding, precision, expr) ->
              let expr_index = resolve_and_get_index expr in
              let precision_index = precision |> resolve_and_get_index in
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
          | Ref _ ->
              (* TODO : handle the case where rule directly reference another rule *)
              failwith "Ref case should be handled by resolve_and_get_index"
        in
        state.nodes <- (current_index, json_content) :: state.nodes ;
        current_index
  (* Ref inlining: resolve Ref nodes to direct indices of referenced values.
   * No separate ref nodes in output - parents directly reference children. *)
  and resolve_and_get_index (value : value) : int =
    match value.value with
    | Ref name ->
        (* Look up the referenced rule and get its value *)
        let referenced_value = Base.Hashtbl.find_exn tree name in
        get_or_create_index referenced_value
    | _ ->
        (* For non-ref values, process normally *)
        get_or_create_index value
  in
  let rule_to_index =
    Base.Hashtbl.fold tree ~init:[] ~f:(fun ~key:rule ~data acc_rules ->
        let index = resolve_and_get_index data in
        (to_string rule, index) :: acc_rules )
  in
  let sorted_nodes =
    List.sort state.nodes ~compare:(fun (i1, _) (i2, _) -> Int.compare i1 i2)
  in
  let nodes_array = Array.of_list (List.map sorted_nodes ~f:snd) in
  (nodes_array, rule_to_index)


let to_json ~eval_tree ~outputs =
  let nodes_array, rule_to_index = json_of_eval_tree_flat eval_tree in
  let outputs =
    List.map outputs ~f:(fun (Shared.Model_outputs.{rule_name; typ; parameters; meta}) ->
        let rule_str = to_string rule_name in
        let node_index = `Int (List.Assoc.find_exn rule_to_index rule_str ~equal:String.equal) in
        let parameters =
          `Assoc (List.map parameters ~f:(fun rule -> (to_string rule, `Null)))
        in
        let type_info =
          let open Shared.Typ in
          match typ with
          | Some (Number (Some unit)) ->
              `Assoc
                [ ("number", `Bool true)
                ; ( "unit"
                  , `String (Stdlib.Format.asprintf "%a" Shared.Units.pp unit)
                  ) ]
          | Some (Number None) ->
              `Assoc [("number", `Bool true)]
          | Some (Literal String) ->
              `Assoc [("string", `Bool true)]
          | Some (Literal Bool) ->
              `Assoc [("boolean", `Bool true)]
          | Some (Literal Date) ->
              `Assoc [("date", `Bool true)]
          | None ->
              `Null
        in
        let meta =
          let open Shared.Shared_ast in
          `Assoc (meta |> List.filter_map ~f:(function
              | Description desc -> Some [("description", `String desc)]
              | Title title -> Some [("title", `String title)]
              | Note note -> Some [("note", `String note)]
              | Custom_meta `Assoc m -> Some m
              | Custom_meta _ -> None
              | Public -> None)
            |> List.concat)
        in
        ( rule_str
        , `Assoc
            [ ("parameters", parameters)
            ; ("type", type_info)
            ; ("nodeIndex", node_index)
            ; ("meta", meta) ] ) )
  in
  `Assoc
    [ ("evaluation", `List (Array.to_list nodes_array))
    ; ("outputs", `Assoc outputs) ]
