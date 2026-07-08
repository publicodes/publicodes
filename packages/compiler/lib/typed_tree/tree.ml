type t = Typ.t Shared.Eval_tree.t

type value = Typ.t Shared.Eval_tree.value

let mk ~pos ?(typ = Typ.any ~pos ()) value =
  {Shared.Eval_tree.value; pos; meta= typ}

let get_type ~pos ~rule tree =
  let rec get_in_value (value : value) =
    if Utils.Pos.equal_pos pos value.pos then Some value.meta
    else
      match value.value with
      | Shared.Eval_tree.Condition (cond, then_comp, else_comp) -> (
        match get_in_value cond with
        | None -> (
          match get_in_value then_comp with
          | None ->
              get_in_value else_comp
          | then_type ->
              then_type )
        | cond_type ->
            cond_type )
      | Shared.Eval_tree.Binary_op (_, left, right) -> (
        match get_in_value left with
        | None ->
            get_in_value right
        | left_type ->
            left_type )
      | Shared.Eval_tree.Unary_op (_, value) ->
          get_in_value value
      | Shared.Eval_tree.Set_context {value; _} ->
          get_in_value value
      | Shared.Eval_tree.Round (_, precision, value) -> (
        match get_in_value precision with
        | None ->
            get_in_value value
        | precision_type ->
            precision_type )
      | Shared.Eval_tree.Ref rule ->
          let typ = Shared.Eval_tree.get_meta tree rule in
          Some typ
      | Get_context _ | Const _ ->
          None
  in
  let value = Shared.Eval_tree.get_value tree rule in
  let type_opt = get_in_value value in
  Option.value type_opt ~default:(Typ.any ~pos ())
