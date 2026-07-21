open Base
open Utils
open Shared

module Rule_vertex = struct
  type t = Rule_name.t * Rule_context.t list [@@deriving equal, compare]

  let hash = Hashtbl.hash

  let to_string ((rule, ctx) : t) =
    let rule_str = Rule_name.to_string rule in
    let ctxs =
      List.map ctx ~f:(fun ctx ->
          let ctx_id_str =
            String.prefix (Id.to_string (Rule_context.id ctx)) 4
          in
          let ctx_rules_str =
            Rule_context.rules_without_pos ctx
            |> List.map ~f:Rule_name.to_string
            |> String.concat ~sep:", "
          in
          Printf.sprintf "%s:{ %s }" ctx_id_str ctx_rules_str )
      |> String.concat ~sep:", "
    in
    let ctx_str = "[" ^ (if String.is_empty ctxs then "" else ctxs) ^ "]" in
    rule_str ^ ", " ^ ctx_str
end

(* Module for edge labels *)
module Ref_edge = struct
  type t = Pos.t [@@deriving compare]

  let hash = Hashtbl.hash

  let default = Pos.dummy (* Default position for edge labels *)
end

(* Create the graph module using the functors *)
module G = Graph.Imperative.Digraph.ConcreteLabeled (Rule_vertex) (Ref_edge)
include G
module Oper = Graph.Oper.I (G)
module Traverse = Graph.Traverse.Dfs (G)

module Dot = Graph.Graphviz.Dot (struct
  include G

  let edge_attributes _ = []

  let default_edge_attributes _ = []

  let get_subgraph _ = None

  let vertex_attributes (v : Rule_vertex.t) =
    let label = Rule_vertex.to_string v in
    [`Label label; `Shape `Ellipse]

  let default_vertex_attributes _ = []

  let graph_attributes _ = []

  let vertex_name ((rule, ctxs) : Rule_vertex.t) =
    let rule_str = Rule_name.to_string rule in
    let ctx_str =
      if List.is_empty ctxs then ""
      else
        String.concat ~sep:"_"
          (List.map ctxs ~f:(fun ctx ->
               let ctx_id = Rule_context.id ctx in
               let ctx_names = Rule_context.rules_without_pos ctx in
               let ctx_names_str =
                 String.concat ~sep:"_"
                   (List.map ~f:Rule_name.to_string ctx_names)
               in
               Printf.sprintf "%s_%s" (Shared.Id.to_string ctx_id) ctx_names_str )
          )
    in
    "\"" ^ rule_str
    ^ (if String.is_empty ctx_str then "" else "_" ^ ctx_str)
    ^ "\""
end)

let output_dot ?(file_path = "./rule_graph.dot") graph =
  let oc = Stdlib.open_out file_path in
  Dot.output_graph oc graph ; Stdlib.close_out oc

let root_vertex rule_name = (rule_name, [])

let rec find_references_in_expr
    ((expr, {pos; _}) : (Rule_name.t, Mark.pos_mark) Shared_ast.expr) :
    Rule_name.t Mark.pos list =
  match expr with
  | Shared_ast.Const _ ->
      []
  | Ref name ->
      [Mark.mk_pos ~pos name]
  | Unary_op (_, expr) ->
      find_references_in_expr expr
  | Binary_op (_, expr, expr') ->
      find_references_in_expr expr @ find_references_in_expr expr'

let get_context current_rule
    (chainable_mechanisms :
      ( (Rule_name.t, Mark.pos_mark) Shared_ast.chainable_mechanism
      , Mark.pos_mark )
      Mark.ed
      list ) : Rule_context.t option =
  (* NOTE: there is only one context for each value, so we can stop at the first
     one we find *)
  List.find_map chainable_mechanisms ~f:(fun (mecha, {pos; _}) ->
      match mecha with
      | Shared_ast.Context contexts ->
          let context_rules = List.map contexts ~f:fst in
          Some (Rule_context.mk current_rule context_rules pos)
      | _ ->
          None )

let rec find_references (only_in_chainable : bool)
    (context_stack : Rule_context.t list) (current_rule : Rule_name.t)
    (({value; chainable_mechanisms}, _) : Shared_ast.resolved_value) :
    Rule_vertex.t Mark.pos list =
  let context_stack, aleady_visited =
    match get_context current_rule chainable_mechanisms with
    | Some ctx ->
        let already_visited =
          List.exists context_stack ~f:(Rule_context.equal ctx)
        in
        (ctx :: context_stack, already_visited)
    | None ->
        (context_stack, false)
  in
  if aleady_visited then []
  else
    let chainable_refs =
      List.concat_map chainable_mechanisms ~f:(fun (mecha, _) ->
          find_references_in_chainable context_stack current_rule mecha )
    in
    if only_in_chainable then chainable_refs
    else
      let value_refs =
        find_references_in_value only_in_chainable context_stack current_rule
          (Mark.remove value)
      in
      value_refs @ chainable_refs

and find_references_in_chainable (context_stack : Rule_context.t list)
    (current_rule : Rule_name.t)
    (chainable_mechanism : (Rule_name.t, 'mark) Shared_ast.chainable_mechanism)
    =
  let find_references = find_references false context_stack current_rule in
  match chainable_mechanism with
  | Shared_ast.Context contexts ->
      List.concat_map contexts ~f:(fun (_, v) -> find_references v)
  | Default v
  | Ceiling v
  | Floor v
  | Round (_, v)
  | Applicable_if v
  | Not_applicable_if v ->
      find_references v
  | Type _ ->
      []

and find_references_in_value (only_in_chainable : bool)
    (context_stack : Rule_context.t list) (current_rule : Rule_name.t)
    (value : (Rule_name.t, 'mark) Shared_ast.value_mechanism) =
  let find_references =
    find_references only_in_chainable context_stack current_rule
  in
  match value with
  | Shared_ast.Not_defined ->
      []
  | Expr expr ->
      find_references_in_expr expr
      |> List.map ~f:(Mark.map ~f:(fun ref_name -> (ref_name, context_stack)))
  | Value v ->
      find_references v
  | Is_applicable v | Is_not_applicable v ->
      find_references v
  | Sum vs | Product vs | All_of vs | Min_of vs | Max_of vs | One_of vs ->
      List.concat_map vs ~f:find_references
  | Variations (variations, else_opt) ->
      let variation_refs =
        List.concat_map variations ~f:(fun {if_; then_} ->
            find_references if_ @ find_references then_ )
      in
      let else_refs =
        match else_opt with Some else_ -> find_references else_ | None -> []
      in
      variation_refs @ else_refs

let mk ast =
  let graph = G.create () in
  let visited_node = ref [] in
  let rec add_rule_dependencies
      ({name; value; _} : Shared_ast.resolved_rule_def)
      (context_stack : Rule_context.t list) =
    let current_rule = Mark.remove name in
    let current_node = (current_rule, context_stack) in
    if List.exists !visited_node ~f:(Rule_vertex.equal current_node) then
      (* Already visited, do nothing *)
      ()
    else (
      visited_node := current_node :: !visited_node ;
      G.add_vertex graph current_node ;
      let only_in_chainable =
        (* If the current rule is already defined by a context in the stack,
          we only want to consider references in chainable mechanisms, as the
          value of the current rule is overridden by the context. *)
        List.exists context_stack ~f:(fun c ->
            Rule_context.rules_without_pos c
            |> List.exists ~f:(Rule_name.equal current_rule) )
      in
      let refs =
        find_references only_in_chainable context_stack current_rule value
      in
      (*  iter refs[i].replaced_by -> ajouter un edge *)
      List.iter refs ~f:(fun (ref_node, {pos= ref_pos}) ->
          let ref_name, ref_ctx_stack = ref_node in
          G.add_vertex graph ref_node ;
          let edge = (current_node, ref_pos, ref_node) in
          G.add_edge_e graph edge ;
          add_rule_dependencies (Shared_ast.find_exn ref_name ast) ref_ctx_stack )
      )
  in
  List.iter ast ~f:(fun rule_def -> add_rule_dependencies rule_def []) ;
  graph
