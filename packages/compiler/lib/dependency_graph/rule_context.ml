open Base
open Shared
module Pos = Utils.Pos

type t = Id.t * Rule_name.t Pos.t list [@@deriving equal, compare]

(* NOTE: could be reset for each root rule *)
let mk current_rule rules pos =
  let id = Id.hash current_rule pos in
  (id, rules)

let id (id, _) = id

let rules (_, rules) = rules

let rules_without_pos (_, rules) = List.map rules ~f:Pos.value

let equal (id1, _) (id2, _) = Id.equal id1 id2

let contains rule_name (_, rules) =
  List.exists rules ~f:(fun (rule, _) -> Rule_name.equal rule rule_name)

let to_string (id, rules) =
  let rules_str =
    List.map rules ~f:(fun (r, _) -> Rule_name.to_string r)
    |> String.concat ~sep:", "
  in
  Printf.sprintf "(%s, { %s })" (Id.to_string id) rules_str

let from_rule_def (rule_def : Rule_name.t Shared_ast.rule_def) : t list =
  let current_rule = Pos.value rule_def.name in
  (* PERF: should be tail-recursive. *)
  let rec get_contexts acc (value : 'a Shared_ast.value) : t list =
    let contexts_in_chainable =
      List.concat_map value.chainable_mechanisms
        ~f:(get_contexts_in_chained_mechanism acc)
    in
    let contexts_in_value = get_contexts_in_value acc value in
    contexts_in_chainable @ contexts_in_value @ acc
  and get_contexts_in_chained_mechanism acc (mecha, pos) : t list =
    match mecha with
    | Context contexts ->
        let current_context_rules, global_acc =
          List.fold contexts
            ~f:(fun (current_acc, global_acc) (ctx_name, v) ->
              (ctx_name :: current_acc, get_contexts global_acc v) )
            ~init:([], acc)
        in
        mk current_rule current_context_rules pos :: global_acc
    | Applicable_if v
    | Not_applicable_if v
    | Default v
    | Ceiling v
    | Floor v
    | Round (_, v) ->
        get_contexts acc v
    | Type _ ->
        acc
  and get_contexts_in_value acc value : t list =
    match Pos.value value.value with
    | Value v | Is_applicable v | Is_not_applicable v ->
        get_contexts_in_value acc v
    | Variations (variations, else_) ->
        let contexts_in_variations =
          List.concat_map variations ~f:(fun {if_; then_} ->
              get_contexts [] if_ @ get_contexts [] then_ )
        in
        let contexts_in_else =
          match else_ with Some else_ -> get_contexts [] else_ | None -> []
        in
        contexts_in_else @ contexts_in_variations @ acc
    | Sum values
    | Product values
    | All_of values
    | Min_of values
    | Max_of values
    | One_of values ->
        List.concat_map values ~f:(get_contexts []) @ acc
    | Expr _ | Not_defined ->
        acc
  in
  get_contexts [] rule_def.value
