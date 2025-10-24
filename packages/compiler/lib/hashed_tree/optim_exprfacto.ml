open Base
open Shared
open Shared.Eval_tree

(* [compute_depth_and_freq] computes, for each hashed node, the number of
	 its occurrence in the tree as well as its depth. *)
let compute_depth_and_freq hashed_tree =
  let freq_depth_table : (Tree.Hash.t, int * int) Hashtbl.t =
    Hashtbl.create (module Tree.Hash)
  in
  let update_depth (node : Tree.value) depth =
    Hashtbl.update freq_depth_table node.meta.hash ~f:(function
      | Some (count, max_depth) ->
          (count, Int.max max_depth depth)
      | None ->
          (1, depth) )
  in
  let rec loop (node : Tree.value) =
    let open Eval_tree in
    let depth =
      match node.value with
      | Const _ | Ref _ | Get_context _ ->
          0
      | Condition (cond, then_comp, else_comp) ->
          let cond_depth = loop cond in
          let then_depth = loop then_comp in
          let else_depth = loop else_comp in
          update_depth cond cond_depth ;
          update_depth then_comp then_depth ;
          update_depth else_comp else_depth ;
          1 + Int.max cond_depth (Int.max then_depth else_depth)
      | Binary_op (_, left, right) ->
          let left_depth = loop left in
          let right_depth = loop right in
          update_depth left left_depth ;
          update_depth right right_depth ;
          1 + Int.max left_depth right_depth
      | Unary_op (_, comp) ->
          let comp_depth = loop comp in
          update_depth comp comp_depth ;
          1 + comp_depth
      | Set_context {context; value} ->
          let context_depths =
            List.map context ~f:(fun (_, comp) ->
                let depth = loop comp in
                update_depth comp depth ; depth + 1 )
          in
          let value_depth = loop value in
          update_depth value value_depth ;
          1 + List.fold context_depths ~init:value_depth ~f:Int.max
      | Round (_, precision, value) ->
          let precision_depth = loop precision in
          let value_depth = loop value in
          update_depth precision precision_depth ;
          update_depth value value_depth ;
          1 + Int.max precision_depth value_depth
    in
    let hash = node.meta.hash in
    let count, max_depth =
      match Hashtbl.find freq_depth_table hash with
      | Some (c, d) ->
          (c + 1, Int.max d depth)
      | None ->
          (1, depth)
    in
    Hashtbl.set freq_depth_table ~key:hash ~data:(count, max_depth) ;
    max_depth
  in
  Hashtbl.iter hashed_tree ~f:(fun node ->
      let node_depth = loop node in
      update_depth node node_depth ) ;
  freq_depth_table

let depth_threshold = 2

let frequency_threshold = 2

let compress hashed_tree =
  let module Id = Utils.Uid.Make () in
  let freq_depth_table = compute_depth_and_freq hashed_tree in
  let resolved_compress_hashed_tree = Hashtbl.copy hashed_tree in
  let hash_to_new_rule : (Tree.Hash.t, Rule_name.t * Tree.value) Hashtbl.t =
    Hashtbl.create (module Tree.Hash)
  in
  let rec compress_node (node : Tree.value) : Tree.value =
    let hash = node.meta.hash in
    let frequency, max_depth =
      match Hashtbl.find freq_depth_table hash with
      | Some (c, d) ->
          (c, d)
      | None ->
          (0, 0)
    in
    let new_rule_name_opt, new_rule =
      match Hashtbl.find hash_to_new_rule hash with
      | Some (rule_name, rule) ->
          (Some rule_name, rule)
      | None ->
          let new_rule_value =
            let open Eval_tree in
            match node.value with
            | Const _ | Ref _ | Get_context _ ->
                node.value
            | Condition (cond, then_comp, else_comp) ->
                Condition
                  ( compress_node cond
                  , compress_node then_comp
                  , compress_node else_comp )
            | Binary_op (op, left, right) ->
                Binary_op (op, compress_node left, compress_node right)
            | Unary_op (op, comp) ->
                Unary_op (op, compress_node comp)
            | Set_context {context; value} ->
                let new_context =
                  List.map context ~f:(fun (rule_name, comp) ->
                      (rule_name, compress_node comp) )
                in
                let new_value = compress_node value in
                Set_context {context= new_context; value= new_value}
            | Round (rounding, precision, value) ->
                Round (rounding, compress_node precision, compress_node value)
          in
          (None, {node with value= new_rule_value})
    in
    if frequency >= frequency_threshold && max_depth >= depth_threshold then
      (* Node is frequent and deep enough to be factored out. I.e.
				 replaced by a reference to a new private rule. *)
      let new_rule_name =
        match new_rule_name_opt with
        | Some rule_name ->
            rule_name
        | None ->
            let new_id = Id.to_string (Id.mk ()) in
            let rule_name = Rule_name.make_reserved ("f" ^ new_id) in
            Hashtbl.set hash_to_new_rule ~key:hash ~data:(rule_name, new_rule) ;
            (* Insert the new rule into the hashed tree. *)
            Hashtbl.set resolved_compress_hashed_tree ~key:rule_name
              ~data:new_rule ;
            rule_name
      in
      (* Return a reference to the new rule. *)
      {node with value= Ref new_rule_name}
    else new_rule
  in
  (* Compress all nodes in the hashed tree. *)
  Hashtbl.iteri hashed_tree ~f:(fun ~key ~data ->
      let compressed_node = compress_node data in
      Hashtbl.set resolved_compress_hashed_tree ~key ~data:compressed_node ) ;
  resolved_compress_hashed_tree
