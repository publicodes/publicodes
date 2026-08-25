open Base
open Shared
open Utils
open Output.Let_syntax

(** Factorizes all the data needed for the typing pass.

    @note The [parent_typ] has in reality two purposes: allowing to unify types
    with the parent one, and also to narrow the expected type. We might want to
    separate this clearly. *)
type typing_context =
  { ast: Ast.typing_tree
  ; replacements: Replacement_graph.Rule_graph.t
  ; rules_type: Ast.typing_value Rule_name.Hashtbl.t
  ; current_rule: Rule_name.t option
  ; parent_typ: Ast.typ option }

let get_init_context ~ast ~replacements =
  { ast
  ; replacements
  ; rules_type= Hashtbl.create (module Shared.Rule_name) ~growth_allowed:true
  ; current_rule= None
  ; parent_typ= None }

let reset_context ?current_rule ?parent_typ ctx =
  Hashtbl.clear ctx.rules_type ;
  {ctx with current_rule; parent_typ}

let to_label (typ : Ast.typ) =
  let typ, Mark.{pos} = UnionFind.get typ in
  match typ with
  | Typed (_, Enum enum) ->
      let msg = Ast.to_string typ |> Stdlib.Format.asprintf "est %s" in
      let msgs =
        List.map enum ~f:(fun (lit, Mark.{pos}) ->
            let msg = Printf.sprintf "avec %s" (Ast.literal_to_string lit) in
            Mark.mk_pos ~pos msg )
      in
      Mark.mk_pos ~pos msg :: msgs
  | _ ->
      let msg = Ast.to_string typ |> Stdlib.Format.asprintf "est %s" in
      [Mark.mk_pos ~pos msg]

let to_labels (u1 : Ast.typ) (u2 : Ast.typ) =
  [u1; u2]
  |> List.sort ~compare:(fun u1 u2 ->
      let _, {Mark.pos= p1} = UnionFind.get u1 in
      let _, {Mark.pos= p2} = UnionFind.get u2 in
      Pos.compare p1 p2 )
  |> List.map ~f:to_label |> List.concat

let error_typ_mismatch (u1 : Ast.typ) (u2 : Ast.typ) =
  let p1 = UnionFind.get u1 |> Mark.pos in
  let code, message = Err.type_incoherence in
  let labels = to_labels u1 u2 in
  (* FIXME: we don't want type errors to be fatal *)
  Output.fatal_error ~pos:p1 ~kind:`Type ~code ~labels message

let error_typ_invalid ?(hints = []) (u1 : Ast.typ) =
  let p1 = UnionFind.get u1 |> Mark.pos in
  let code, message = Err.type_invalid_type in
  let labels = to_label u1 in
  Output.fatal_error ~pos:p1 ~hints ~kind:`Type ~code ~labels message

let error_pow_exponent_with_unit (typ : Ast.typ) ~(pos : Pos.t) =
  let elem = UnionFind.get typ in
  let code, message = Err.pow_exponent_with_unit in
  let labels =
    match Mark.remove elem with
    | Ast.Typed (Ast.KNumber u, _) ->
        let inferred_typ_pos = Mark.pos elem in
        let main_label =
          Mark.mk_pos ~pos
            (Printf.sprintf "unité: %s" (Number_unit.to_string u))
        in
        if Pos.equal pos inferred_typ_pos then [main_label]
        else [main_label; Mark.mk_pos ~pos:inferred_typ_pos "définie ici"]
    | _ ->
        []
  in
  Output.fatal_error ~pos ~kind:`Type ~code ~labels message

(** FIXME: should be an incompatible type error instead of missing enums and
    should point to the problematic operation instead of the loc of the type
    defs. *)
let error_missing_enums enums (u1 : Ast.typ) (u2 : Ast.typ) =
  let p1 = UnionFind.get u1 |> Mark.pos in
  let enums =
    List.map enums ~f:Mark.remove |> List.map ~f:Ast.literal_to_string_short
  in
  let code, message = Err.type_missing_enums enums in
  let labels = to_labels u1 u2 in
  Output.fatal_error ~pos:p1 ~kind:`Type ~code ~labels message

(** [is_unifiable_precisions expected actual] returns true if [actual] is at
    least as precise as [expected]. *)
let is_unifiable_precisions expected actual =
  match (expected, actual) with
  | Ast.Any_kind _, (Ast.Any_kind _ | Ast.General | Ast.Enum _ | Ast.Literal _)
    ->
      true
  | Ast.General, (Ast.General | Ast.Enum _ | Ast.Literal _) ->
      true
  | Ast.Enum e1, Ast.Enum e2 ->
      Ast.is_enum_subset e2 e1
  | Ast.Enum _, Ast.Literal _ ->
      true
  | Ast.Literal (l1, _), Ast.Literal (l2, _) ->
      Ast.equal_literal l1 l2
  | _ ->
      false

let unify_number_units ~pos1 ~pos2 typ1 typ2 =
  match (typ1, typ2) with
  | Ast.Typed (Ast.KNumber u1, _), Ast.Typed (Ast.KNumber u2, _) ->
      let* _ = Number_unit.unify ~pos1 ~pos2 u1 u2 in
      Output.return ()
  | _ ->
      Output.return ()

let return_error_if_missing_literals typ1 typ2 e1 e2 =
  let missing = Ast.get_missing_literals e1 e2 in
  if List.is_empty missing then Output.return ()
  else error_missing_enums missing typ1 typ2

(** [check_union typ1 typ2] tries to merge [typ1] and [typ2] by keeping the most
    precise one and returns an error if the types are incompatible (not the same
    kind, or precisions*)
let check_union (typ1 : Ast.typ) (typ2 : Ast.typ) : unit Output.t =
  let unify_enums p1 p2 =
    match (p1, p2) with
    | Ast.Enum e1, Ast.Enum e2 ->
        return_error_if_missing_literals typ1 typ2 e1 e2
    | _ ->
        Output.return ()
  in
  let unify_precisions p1 p2 =
    if is_unifiable_precisions p1 p2 then
      let* _ = unify_enums p1 p2 in
      let _ = UnionFind.merge (fun _ snd -> snd) typ1 typ2 in
      Output.return ()
    else if is_unifiable_precisions p2 p1 then
      let* _ = unify_enums p2 p1 in
      let _ = UnionFind.merge (fun fst _ -> fst) typ1 typ2 in
      Output.return ()
    else Output.return ()
  in
  let m1 = UnionFind.get typ1 in
  let m2 = UnionFind.get typ2 in
  let t1, {Mark.pos= pos1} = m1 in
  let t2, {Mark.pos= pos2} = m2 in
  match (t1, t2) with
  | Ast.Any _, _ ->
      let _ = UnionFind.merge (fun _ snd -> snd) typ1 typ2 in
      Output.return ()
  | _, Any _ ->
      let _ = UnionFind.merge (fun fst _ -> fst) typ1 typ2 in
      Output.return ()
  | Typed (KNumber _, p1), Typed (KNumber _, p2) ->
      let* _ = unify_number_units ~pos1 ~pos2 t1 t2 in
      let* _ = unify_enums p1 p2 in
      ( match (p1, p2) with
      | Any_kind _, Any_kind _ ->
          ignore (UnionFind.union typ1 typ2)
      | Any_kind _, _ ->
          ignore (UnionFind.merge (fun _ snd -> snd) typ1 typ2)
      | _, Any_kind _ ->
          ignore (UnionFind.merge (fun fst _ -> fst) typ1 typ2)
      | _ ->
          () ) ;
      Output.return ()
  | Typed (k1, p1), Typed (k2, p2) when Ast.is_kind_equal k1 k2 ->
      unify_precisions p1 p2
  | _, _ ->
      error_typ_mismatch typ1 typ2

let check_union_with_parent_typ ~ctx typ =
  match ctx.parent_typ with
  | Some ptyp ->
      let* _ = check_union typ ptyp in
      Output.return ()
  | None ->
      Output.return ()

let get_literals_from_precision = function
  | Ast.Enum lits ->
      lits
  | Ast.Literal lit ->
      [lit]
  | _ ->
      []

(** [check_generalize typ1 typ2 ~grow] tries to generalize [typ1] and [typ2] by
    keeping the most general one and returns an error if the types are
    incompatible (not the same kind, or precisions).

    If [grow] is true, it will also grow the enumerations to include all
    literals from both types. For now, this is only true for symbols.

    @note If [grow] is false, [typ1] is the expected type and [typ2] is the
    actual type, and will Output.return an error if [typ2] is not a subset of [typ1]. *)
let check_generalize ?(grow = true) (typ1 : Ast.typ) (typ2 : Ast.typ) :
    unit Output.t =
  let t1, {Mark.pos= pos1} = UnionFind.get typ1 in
  let t2, {Mark.pos= pos2} = UnionFind.get typ2 in
  let set_typ1 typ =
    let _ = UnionFind.set typ1 (Mark.mk_pos ~pos:pos1 typ) in
    Output.return ()
  in
  let set_typ2 typ =
    let _ = UnionFind.set typ2 (Mark.mk_pos ~pos:pos2 typ) in
    Output.return ()
  in
  let symbolize_any kind precision =
    match (kind, precision) with
    | Ast.KSymbol, Ast.Literal lit ->
        Ast.Typed (Ast.KSymbol, Ast.mk_enum_precision [lit])
    | Ast.KSymbol, Ast.Enum e ->
        Ast.Typed (Ast.KSymbol, Ast.mk_enum_precision e)
    | _ ->
        Ast.Typed (kind, Ast.Any_kind (Ast.Any.mk ()))
  in
  (* Try to unify number units first
     NOTE: the only reason to try it first is to factorize the following pattern
     matching and to avoid to handle KNumber differently. *)
  let* _ = unify_number_units ~pos1 ~pos2 t1 t2 in
  match (t1, t2) with
  | Ast.Any _, Ast.Any _ ->
      let _ = UnionFind.union typ1 typ2 in
      Output.return ()
  | Ast.Any _, Ast.Typed (k, p) ->
      set_typ1 (symbolize_any k p)
  | Ast.Typed (k, p), Ast.Any _ ->
      set_typ2 (symbolize_any k p)
  | Ast.Typed (Ast.KSymbol, p1), Ast.Typed (Ast.KSymbol, p2) -> (
    match (p1, p2) with
    | Ast.Literal (Ast.LSymbol s1, _), Ast.Literal (Ast.LSymbol s2, _) ->
        if String.equal s1 s2 then Output.return ()
        else error_typ_mismatch typ1 typ2
    | Ast.Enum e, Ast.Literal lit ->
        if grow then
          set_typ1 Ast.(Typed (KSymbol, mk_enum_precision (e @ [lit])))
        else return_error_if_missing_literals typ2 typ1 [lit] e
    | Ast.Literal lit, Ast.Enum e ->
        if grow then
          set_typ2 Ast.(Typed (KSymbol, mk_enum_precision (e @ [lit])))
        else return_error_if_missing_literals typ1 typ2 e [lit]
    | Ast.Enum e1, Ast.Enum e2 ->
        if grow then
          let merged =
            Ast.Typed (Ast.KSymbol, Ast.mk_enum_precision (e1 @ e2))
          in
          let _ = set_typ1 merged in
          set_typ2 merged
        else return_error_if_missing_literals typ2 typ1 e2 e1
    | _ ->
        error_typ_mismatch typ1 typ2 )
  | Ast.Typed (k1, _), Ast.Typed (k2, _) when Ast.is_kind_equal k1 k2 ->
      Output.return ()
  | _ ->
      error_typ_mismatch typ1 typ2

let get_number_unit_opt = function
  | Ast.Typed (KNumber unit, _) ->
      Some unit
  | _ ->
      None

let check_multiply ~pos u1 u2 : Ast.typ Output.t =
  let t1, _ = UnionFind.get u1 in
  let t2, _ = UnionFind.get u2 in
  match (get_number_unit_opt t1, get_number_unit_opt t2) with
  | Some unit1, Some unit2 ->
      let t = Number_unit.multiply unit1 unit2 in
      let m = Ast.mk_general ~pos Ast.(KNumber t) in
      Output.return m
  | _, _ ->
      let msg1 = Ast.to_string t1 in
      let msg2 = Ast.to_string t2 in
      let msg = Stdlib.Format.asprintf "Can't multiply '%s' '%s'" msg1 msg2 in
      failwith msg

let check_divide ~pos u1 u2 : Ast.typ Output.t =
  let t1, _ = UnionFind.get u1 in
  let t2, _ = UnionFind.get u2 in
  match (get_number_unit_opt t1, get_number_unit_opt t2) with
  | Some unit1, Some unit2 ->
      let t = Number_unit.divide unit1 unit2 in
      let m = Ast.mk_general ~pos Ast.(KNumber t) in
      Output.return m
  | _, _ ->
      let msg1 = Ast.to_string t1 in
      let msg2 = Ast.to_string t2 in
      let msg = Stdlib.Format.asprintf "Can't divide '%s' '%s'" msg1 msg2 in
      failwith msg

let check_enumerate ~pos typ1 typ2 : Ast.typ Output.t =
  let t1, {Mark.pos= pos1} = UnionFind.get typ1 in
  let t2, {Mark.pos= pos2} = UnionFind.get typ2 in
  let merge_typ1 () =
    let _ = UnionFind.merge (fun fst _ -> fst) typ1 typ2 in
    Output.return typ1
  in
  let merge_typ2 () =
    let _ = UnionFind.merge (fun _ snd -> snd) typ1 typ2 in
    Output.return typ2
  in
  (* Try to unify number units first
     NOTE: the only reason to try it first is to factorize the following pattern
     matching and to avoid to handle KNumber differently. *)
  let* _ = unify_number_units ~pos1 ~pos2 t1 t2 in
  match (t1, t2) with
  (* Merge Anys *)
  | Ast.Any _, Ast.Any _ ->
      let _ = UnionFind.union typ1 typ2 in
      Output.return typ1
  | Ast.Typed (k1, Any_kind _), Ast.Typed (k2, Any_kind _)
    when Ast.is_kind_equal k1 k2 ->
      let _ = UnionFind.union typ1 typ2 in
      Output.return typ1
  | Ast.Any _, Ast.Typed (_, (Any_kind _ | General)) ->
      merge_typ2 ()
  | Ast.Typed (_, (Any_kind _ | General)), Ast.Any _ ->
      merge_typ1 ()
  | Ast.Typed (_, ((Literal _ | Enum _) as p)), Ast.Any _
  | Ast.Any _, Ast.Typed (_, ((Literal _ | Enum _) as p)) ->
      let lits = get_literals_from_precision p in
      let enum = Ast.mk_enum ~pos lits in
      Output.return enum
  (* Fills *)
  | Ast.Typed (k1, p1), Ast.Typed (k2, p2) when Ast.is_kind_equal k1 k2 -> (
    match (p1, p2) with
    | General, _ | _, General ->
        Output.return (Ast.mk_general ~pos k1)
    | Any_kind _, Any_kind _ ->
        let _ = UnionFind.union typ1 typ2 in
        Output.return typ1
    | (Literal _ | Enum _), (Literal _ | Enum _) ->
        let lits1 = get_literals_from_precision p1 in
        let lits2 = get_literals_from_precision p2 in
        Output.return (Ast.mk_enum ~pos (lits1 @ lits2))
    | Any_kind _, ((Literal _ | Enum _) as p)
    | ((Literal _ | Enum _) as p), Any_kind _ ->
        let lits = get_literals_from_precision p in
        let enum = Ast.mk_enum ~pos lits in
        Output.return enum )
  | _, _ ->
      error_typ_mismatch typ1 typ2

let rec check_expression (expr : Ast.typing_expr) ~ctx =
  let expr, mark = expr in
  let pos = mark.pos in
  let get_checked_rule_def ref =
    let rule_def, status = Hashtbl.find_exn ctx.ast ref in
    let* _ =
      match status with
      | Todo ->
          check_rule_def rule_def ~ctx
      | Error ->
          Output.empty
      | _ ->
          Output.return ()
    in
    Output.return rule_def
  in
  let check_expression_is_any_number expr ~pos =
    let typ = Ast.mk_any_number ~pos in
    let* _ = check_expression expr ~ctx:{ctx with parent_typ= Some typ} in
    Output.return typ
  in
  match expr with
  | Const _ ->
      check_union_with_parent_typ ~ctx mark.typ
  | Ref ref ->
      let* _ =
        let* value =
          match Hashtbl.find ctx.rules_type ref with
          | Some value ->
              Output.return value
          | None ->
              let* rule_def = get_checked_rule_def ref in
              Output.return rule_def.value
        in
        let value_mark = Mark.get value in
        let replacements =
          match ctx.current_rule with
          | Some from ->
              Replacement_graph.find_transitive_replacements ctx.replacements
                ~from ~rule:ref
              |> List.map ~f:Mark.remove
          | None ->
              []
        in
        let* typ =
          Output.fold_no_interrupt replacements ~init:value_mark.typ
            ~f:(fun ptyp ref ->
              (* TODO: we should have a dedicated type error for replacements. *)
              let* rule_def = get_checked_rule_def ref in
              let mark = Mark.get rule_def.value in
              (* We need to verify that the type of the replacement is
                 compatible with the type of the original value (i.e. at least
                 as precise). *)
              check_enumerate ~pos ptyp mark.typ )
        in
        check_union_with_parent_typ ~ctx typ
      in
      check_union_with_parent_typ ~ctx mark.typ
  | Binary_op (op, ((_, left_mark) as left), ((_, right_mark) as right)) -> (
      let Ast.{pos= left_pos; _} = left_mark in
      let Ast.{pos= right_pos; _} = right_mark in
      match Mark.remove op with
      | And | Or ->
          let* _ = Ast.mk_bool ~pos |> check_union mark.typ in
          let* _ =
            check_expression left ~ctx:{ctx with parent_typ= Some mark.typ}
          in
          let* _ =
            check_expression right ~ctx:{ctx with parent_typ= Some mark.typ}
          in
          check_union_with_parent_typ ~ctx mark.typ
      | Add | Sub | Max | Min ->
          let* left = check_expression_is_any_number left ~pos:left_pos in
          let* right = check_expression_is_any_number right ~pos:right_pos in
          let* _ = check_generalize left right in
          let _ =
            (* Operation on number must generalize from literals to number *)
            let number_with_unit = Ast.literal_to_general left in
            UnionFind.set mark.typ (Mark.mk_pos ~pos number_with_unit)
          in
          check_union_with_parent_typ ~ctx mark.typ
      | Mul ->
          let* _ = check_expression_is_any_number left ~pos:left_pos in
          let* _ = check_expression_is_any_number right ~pos:right_pos in
          let* mul_typ = check_multiply ~pos left_mark.typ right_mark.typ in
          let* _ = check_union mark.typ mul_typ in
          check_union_with_parent_typ ~ctx mark.typ
      | Div ->
          let* _ = check_expression_is_any_number left ~pos:left_pos in
          let* _ = check_expression_is_any_number right ~pos:right_pos in
          let* div_typ = check_divide ~pos left_mark.typ right_mark.typ in
          let* _ = check_union mark.typ div_typ in
          check_union_with_parent_typ ~ctx mark.typ
      | Pow ->
          let* _ = check_expression_is_any_number left ~pos:left_pos in
          let* _ =
            let* exponent_typ =
              check_expression_is_any_number right ~pos:right_pos
            in
            if Ast.is_typ_number_with_unit exponent_typ then
              error_pow_exponent_with_unit exponent_typ ~pos:right_pos
            else Output.return ()
          in
          (* Power operation aren't handle by the unit system, so we need to
                 remove the unit from the expression. *)
          UnionFind.set mark.typ (Mark.mk_pos ~pos Ast.number_without_unit) ;
          check_union_with_parent_typ ~ctx mark.typ
      | Gt | Lt | GtEq | LtEq | Eq | NotEq ->
          let* left =
            let left_typ = Ast.mk_any ~pos:left_pos in
            let* _ =
              check_expression left ~ctx:{ctx with parent_typ= Some left_typ}
            in
            Output.return left_typ
          in
          let* right =
            let right_typ = Ast.mk_any ~pos:right_pos in
            let* _ =
              check_expression right ~ctx:{ctx with parent_typ= Some right_typ}
            in
            Output.return right_typ
          in
          (* TODO: restrict possible types? *)
          let* _ = check_generalize left right in
          check_union_with_parent_typ ~ctx (Ast.mk_bool ~pos) )
  | Unary_op ((Neg, _), expr) ->
      let expr_typ = Ast.mk_number ~unit:None ~pos in
      let* _ =
        check_expression expr ~ctx:{ctx with parent_typ= Some expr_typ}
      in
      let* _ = check_union mark.typ expr_typ in
      check_union_with_parent_typ ~ctx expr_typ

and check_value_mechanism (value : Ast.typing_marked_value_mechanism) ~ctx =
  let value, mark = value in
  let pos = mark.pos in
  let check_each values ~mk_wip:mk_typ : Ast.typ list Output.t =
    List.map values ~f:(fun value ->
        let typ = mk_typ () in
        let* _ = check_value value ~ctx:{ctx with parent_typ= Some typ} in
        Output.return typ )
    |> Output.all_okay
  in
  match value with
  | Expr expr ->
      check_expression expr ~ctx:{ctx with parent_typ= Some mark.typ}
  | Value value ->
      check_value value ~ctx:{ctx with parent_typ= Some mark.typ}
  | Is_applicable _ | Is_not_applicable _ ->
      (* TODO: handle this when Not_applicable is a type *)
      Output.return ()
  | Sum [] | Min_of [] | Max_of [] | Product [] ->
      Output.return ()
  | Sum values | Min_of values | Max_of values ->
      let* _ = check_each values ~mk_wip:(fun () -> Ast.mk_any_number ~pos) in
      let fst_pos = Ast.get_first_element_pos_exn values in
      let sum_typ = Ast.mk_number ~unit:None ~pos:fst_pos in
      let* _ =
        List.map values ~f:(fun (_, value_mark) ->
            check_union sum_typ value_mark.typ )
        |> Output.all_okay
      in
      check_union sum_typ mark.typ
  | Product values ->
      let* typs =
        check_each values ~mk_wip:(fun () -> Ast.mk_any_number ~pos)
      in
      let* product_typ =
        match typs with
        | hd :: rest ->
            Output.fold rest ~init:hd ~f:(check_multiply ~pos)
        | [] ->
            failwith "unreachable"
      in
      check_union product_typ mark.typ
  | All_of values | One_of values ->
      let* _ =
        List.map values
          ~f:
            (check_value
               ~ctx:{ctx with parent_typ= Some (Ast.mk_any_bool ~pos)} )
        |> Output.all_okay
      in
      let bool_typ = Ast.mk_bool ~pos in
      check_union bool_typ mark.typ
  | Not_defined ->
      Output.return ()
  | Variations (variations, value) ->
      let any_typ = Ast.mk_any ~pos in
      let check_branch_and_enumerate branch_value prev_typ =
        let branch_typ = Ast.mk_any ~pos in
        let* _ =
          check_value branch_value ~ctx:{ctx with parent_typ= Some branch_typ}
        in
        check_enumerate ~pos prev_typ branch_typ
      in
      let* variations_typ =
        Output.fold variations ~init:any_typ ~f:(fun prev_typ {if_; then_} ->
            let* _ =
              check_value if_
                ~ctx:{ctx with parent_typ= Some (Ast.mk_any_bool ~pos)}
            in
            check_branch_and_enumerate then_ prev_typ )
      in
      let* variations_with_else_typ =
        match value with
        | None ->
            Output.return variations_typ
        | Some else_ ->
            check_branch_and_enumerate else_ variations_typ
      in
      check_union variations_with_else_typ mark.typ

and check_chainable_mechanism
    (chainable : Ast.typing_marked_chainable_mechanism) ~ctx =
  let chainable, mark = chainable in
  let pos = mark.pos in
  let with_value_typ f =
    match ctx.parent_typ with
    | Some ptyp ->
        let* _ = f ptyp in
        Output.return ()
    | None ->
        failwith
          "check_chainable_mechanism: type checking without parent type \
           (corresponding to the value mechanism type). This should not \
           happen."
  in
  match chainable with
  | Context _ ->
      (* Contexts needs to be checked before the value mechanism. *)
      check_union_with_parent_typ ~ctx mark.typ
  | Applicable_if value | Not_applicable_if value ->
      let* _ =
        check_value value ~ctx:{ctx with parent_typ= Some (Ast.mk_any_bool ~pos)}
      in
      check_union_with_parent_typ ~ctx mark.typ
  | Type (typ, {Mark.pos}) ->
      let type_def_typ = Ast.mk_typ ~pos typ in
      with_value_typ (fun ptyp ->
          let* _ = check_generalize type_def_typ ptyp ~grow:false in
          check_union type_def_typ mark.typ )
  | Default value ->
      let default_typ = Ast.mk_any ~pos in
      let* _ = check_value value ~ctx:{ctx with parent_typ= Some default_typ} in
      with_value_typ (fun ptyp ->
          let* default_typ = check_enumerate ~pos default_typ ptyp in
          let* _ = check_union default_typ mark.typ in
          check_union mark.typ ptyp )
  | Ceiling value | Floor value ->
      let* value_typ =
        let value_typ = Ast.mk_any_number ~pos in
        let* _ = check_value value ~ctx:{ctx with parent_typ= Some value_typ} in
        Output.return value_typ
      in
      let* _ = check_union value_typ mark.typ in
      check_union_with_parent_typ ~ctx mark.typ
  | Round (_, value) ->
      let* _ = check_value value ~ctx:{ctx with parent_typ= None} in
      let _, value_mark = value in
      let typ, {Mark.pos} = UnionFind.get value_mark.typ in
      let wip = Ast.mk_number ~unit:None ~pos in
      let* _ =
        if Ast.is_bool typ then Output.return ()
        else
          match get_number_unit_opt typ with
          | Some unit ->
              let concrete = Number_unit.to_concrete unit in
              if Units.equal concrete (Units.parse_unit "décimales") then
                Output.return ()
              else check_union value_mark.typ wip
          | None ->
              let hints = ["arrondi doit être un nombre ou un booléen"] in
              error_typ_invalid ~hints value_mark.typ
      in
      let* _ = check_union wip mark.typ in
      check_union_with_parent_typ ~ctx mark.typ

and check_contexts (chainables : Ast.typing_marked_chainable_mechanism list)
    ~ctx =
  let check_context_entry ref_name value =
    let* ref_rule_typ =
      let rule_def, _ = Hashtbl.find_exn ctx.ast ref_name in
      let* _ = check_rule_def rule_def ~ctx in
      let value_mark = Mark.get rule_def.value in
      Output.return value_mark.typ
    in
    let* val_typ =
      let* _ = check_value value ~ctx:{ctx with parent_typ= None} in
      let _, value_mark = value in
      Output.return value_mark.typ
    in
    let* _ = check_generalize ref_rule_typ val_typ in
    Hashtbl.set ctx.rules_type ~key:ref_name ~data:value ;
    Output.return ()
  in
  List.map chainables ~f:(fun (chainable, _) ->
      match chainable with
      | Context values ->
          let* _ =
            List.map values ~f:(fun ((ref, _), value) ->
                check_context_entry ref value )
            |> Output.all_okay
          in
          Output.return ()
      | _ ->
          Output.return () )
  |> Output.all_okay

and check_value value ~ctx =
  let Shared_ast.{value= value_mecha; chainable_mechanisms}, value_mark =
    value
  in
  (* We need to check the contexts first, because this can narrow the expected
     type of references in the value mechanism. *)
  let* _ = check_contexts chainable_mechanisms ~ctx in
  let* _ = check_value_mechanism value_mecha ~ctx in
  let _, value_mecha_mark = value_mecha in
  let* chainable_typ =
    Ast.get_sorted_chainable_mechanisms chainable_mechanisms
    |> Output.fold ~init:value_mecha_mark.typ ~f:(fun value_typ chainable ->
        let* _ =
          check_chainable_mechanism chainable
            ~ctx:{ctx with parent_typ= Some value_typ}
        in
        let _, mark = chainable in
        Output.return mark.typ )
  in
  let* _ = check_union chainable_typ value_mark.typ in
  check_union_with_parent_typ ~ctx value_mark.typ

and check_make_not_applicable
    (make_not_applicable : 'ref Shared_ast.replace list) ~ptyp =
  match make_not_applicable with
  | [] ->
      Output.return ()
  | hd :: _ ->
      let typ = Ast.mk_any_bool ~pos:(Mark.pos hd.reference) in
      check_union typ ptyp

and check_rule_def rule_def ~ctx =
  let rule_name = Mark.remove rule_def.name in
  let _, typing_state = Hashtbl.find_exn ctx.ast rule_name in
  if not (Ast.is_todo typing_state) then Output.return ()
  else (
    Ast.set_typing_state ctx.ast rule_def Ast.Doing ;
    let Shared_ast.{value; name= current_rule, _; _} = rule_def in
    let res =
      let* _ =
        let ctx = reset_context ctx ~current_rule in
        check_value value ~ctx
      in
      let _, mark = value in
      check_make_not_applicable rule_def.make_not_applicable ~ptyp:mark.typ
    in
    match res with
    | None, logs ->
        Ast.set_typing_state ctx.ast rule_def Ast.Error ;
        Output.break ~logs ()
    | Some _, logs ->
        Ast.set_typing_state ctx.ast rule_def Ast.Done ;
        Output.break ~logs () )

let type_check ~replaces ast =
  let ctx = get_init_context ~ast ~replacements:replaces in
  let* _ =
    Ast.get_sorted_rule_defs ast
    |> List.map ~f:(check_rule_def ~ctx)
    |> Output.all_okay
  in
  Output.return ()
