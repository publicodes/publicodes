open Base
open Shared
open Utils
open Output

let to_label (typ : Ast.typ) =
  let typ, {Mark.pos} = UnionFind.get typ in
  match typ with
  | TEnum enum ->
      let msg =
        Ast.to_string ~sep:", " typ |> Stdlib.Format.asprintf "est %s"
      in
      let msgs =
        Ast.sort_enum enum
        |> List.map ~f:(fun (lit, {Mark.pos}) ->
            let msg =
              Ast.to_string ~sep:"" (Ast.Literal (Mark.mk_pos ~pos lit))
              |> Stdlib.Format.asprintf "avec %s"
            in
            Mark.mk_pos ~pos msg )
      in
      Mark.mk_pos ~pos msg :: msgs
  | _ ->
      let msg =
        Ast.to_string ~sep:", " typ |> Stdlib.Format.asprintf "est %s"
      in
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
  let _p2 = UnionFind.get u2 |> Mark.pos in
  let code, message = Err.type_incoherence in
  let labels = to_labels u1 u2 in
  fatal_error ~pos:p1 ~kind:`Type ~code ~labels message

let error_typ_invalid ?(hints = []) (u1 : Ast.typ) =
  let p1 = UnionFind.get u1 |> Mark.pos in
  let code, message = Err.type_invalid_type in
  let labels = to_label u1 in
  fatal_error ~pos:p1 ~hints ~kind:`Type ~code ~labels message

let error_missing_enums enums (u1 : Ast.typ) (u2 : Ast.typ) =
  let p1 = UnionFind.get u1 |> Mark.pos in
  let _p2 = UnionFind.get u2 |> Mark.pos in
  let enums =
    Ast.sort_enum enums |> List.map ~f:fst |> List.map ~f:Ast.literal_to_string
  in
  let code, message = Err.type_missing_enums enums in
  let labels = to_labels u1 u2 in
  fatal_error ~pos:p1 ~kind:`Type ~code ~labels message

(* TODO: pass pos and add a lavel error here *)
let check_union (u1 : Ast.typ) (u2 : Ast.typ) : unit Output.t =
  let m1 = UnionFind.get u1 in
  let m2 = UnionFind.get u2 in
  let t1, {Mark.pos= pos1} = m1 in
  let t2, {Mark.pos= pos2} = m2 in
  match (t1, t2) with
  (* Check Any Number *)
  | Ast.Any_number unit1, Ast.Any_number unit2
  | Ast.Literal (LNumber (_, unit1), _), Ast.Any_number unit2
  | TNumber unit1, Ast.Any_number unit2
  | TEnum ((LNumber (_, unit1), _) :: _), Ast.Any_number unit2 ->
      let* _ = Number_unit.unify ~pos1 ~pos2 unit1 unit2 in
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  | Ast.Any_number unit1, Ast.Literal (LNumber (_, unit2), _)
  | Ast.Any_number unit1, TNumber unit2
  | Ast.Any_number unit1, TEnum ((LNumber (_, unit2), _) :: _) ->
      let* _ = Number_unit.unify ~pos1 ~pos2 unit1 unit2 in
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  (* Check Number *)
  | Ast.Literal (LNumber (_, u1), _), Ast.Literal (LNumber (_, u2), _)
  | Ast.TNumber u1, Ast.TNumber u2
  | Ast.Literal (LNumber (_, u1), _), Ast.TNumber u2
  | Ast.TNumber u1, Ast.Literal (LNumber (_, u2), _)
  | TEnum ((LNumber (_, u1), _) :: _), Ast.TNumber u2
  | TEnum ((LNumber (_, u1), _) :: _), Ast.Literal (LNumber (_, u2), _)
  | Ast.TNumber u1, TEnum ((LNumber (_, u2), _) :: _)
  | Ast.Literal (LNumber (_, u1), _), TEnum ((LNumber (_, u2), _) :: _) ->
      let* _ = Number_unit.unify ~pos1 ~pos2 u1 u2 in
      return ()
  (* Check Enums (second fit in first) *)
  | TEnum (_ as lits1), TEnum (_ as lits2) ->
      let* _ =
        match (lits1, lits2) with
        | (LNumber (_, u1), _) :: _, (LNumber (_, u2), _) :: _ ->
            Number_unit.unify ~pos1 ~pos2 u1 u2
        | _, _ ->
            return ()
      in
      (* TODO: unify numbers *)
      let missing =
        List.filter lits2 ~f:(fun (lit2, _) ->
            List.exists lits1 ~f:(fun (lit1, _) -> Ast.equal_literal lit1 lit2)
            |> not )
      in
      if List.is_empty missing then return ()
      else error_missing_enums missing u1 u2
  | ty1, ty2 when Ast.is_any_equal ty1 ty2 ->
      let _ = UnionFind.union u1 u2 in
      return ()
  | Ast.Any _, _ ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  | _, Ast.Any _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  (* Check Any String *)
  | ty, Ast.Any_string _ when Ast.is_specialized_string ty ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  | Ast.Any_string _, ty when Ast.is_specialized_string ty ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  (* Check Any Bool *)
  | ty, Ast.Any_bool _ when Ast.is_specialized_bool ty ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  | Ast.Any_bool _, ty when Ast.is_specialized_bool ty ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  (* Check Any Date *)
  | ty, Ast.Any_date _ when Ast.is_specialized_date ty ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  | Ast.Any_date _, ty when Ast.is_specialized_date ty ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  | type1, type2 when Ast.equal_type type1 type2 ->
      return ()
  | _, _ ->
      error_typ_mismatch u1 u2

(* checks but keeps the least precise side general *)
let check_generalize (u1 : Ast.typ) (u2 : Ast.typ) : unit Output.t =
  let t1, {Mark.pos= pos1} = UnionFind.get u1 in
  let t2, {Mark.pos= pos2} = UnionFind.get u2 in
  match (t1, t2) with
  (* Merge Anys *)
  | Ast.Any_number unit1, Ast.Any_number unit2 ->
      (* Merge them *)
      let* _ = Number_unit.unify ~pos1 ~pos2 unit1 unit2 in
      let _ = UnionFind.union u1 u2 in
      return ()
  | t1, t2 when Ast.is_any_equal t1 t2 ->
      let _ = UnionFind.union u1 u2 in
      return ()
  | Ast.Any _, ty when Ast.is_any ty ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  | ty, Ast.Any _ when Ast.is_any ty ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  (* Check Numbers *)
  | Ast.Any _, Ast.TNumber unit
  | Ast.Any _, Ast.Literal (LNumber (_, unit), _)
  | Ast.Any _, Ast.TEnum ((LNumber (_, unit), _) :: _) ->
      let typ = Ast.Any_number unit in
      let _ = UnionFind.set u1 (Mark.mk_pos ~pos:pos1 typ) in
      return ()
  | Ast.TNumber unit, Ast.Any _
  | Ast.Literal (LNumber (_, unit), _), Ast.Any _
  | Ast.TEnum ((LNumber (_, unit), _) :: _), Ast.Any _ ->
      let typ = Ast.Any_number unit in
      let _ = UnionFind.set u2 (Mark.mk_pos ~pos:pos2 typ) in
      return ()
  | Ast.Any_number unit1, Ast.Literal (LNumber (_, unit2), _)
  | Ast.Literal (LNumber (_, unit1), _), Ast.TEnum ((LNumber (_, unit2), _) :: _)
  | Ast.Any_number unit1, Ast.TEnum ((LNumber (_, unit2), _) :: _)
  | Ast.Literal (LNumber (_, unit1), _), Ast.Any_number unit2
  | Ast.TEnum ((LNumber (_, unit1), _) :: _), Ast.Any_number unit2
  | Ast.TNumber unit1, Ast.Any_number unit2
  | Ast.TNumber unit1, Ast.Literal (LNumber (_, unit2), _)
  | Ast.TNumber unit1, Ast.TEnum ((LNumber (_, unit2), _) :: _)
  | Ast.Any_number unit1, Ast.TNumber unit2
  | Ast.TNumber unit1, Ast.TNumber unit2
  | Ast.Literal (LNumber (_, unit1), _), Ast.TNumber unit2
  | Ast.TEnum ((LNumber (_, unit1), _) :: _), Ast.TNumber unit2
  | Ast.TEnum ((LNumber (_, unit1), _) :: _), Ast.Literal (LNumber (_, unit2), _)
  | Ast.Literal (LNumber (_, unit1), _), Ast.Literal (LNumber (_, unit2), _) ->
      (* Gather units, leave any_number alone *)
      let* _ = Number_unit.unify ~pos1 ~pos2 unit1 unit2 in
      return ()
  | ty1, ty2 when Ast.equal_type ty1 ty2 ->
      return ()
  (* Check Bools *)
  | Ast.Any _, ty when Ast.is_specialized_bool ty ->
      let typ = Ast.mk_any_bool ~pos:pos1 in
      let _ = UnionFind.merge (fun a _ -> a) typ u1 in
      return ()
  | ty, Ast.Any _ when Ast.is_specialized_bool ty ->
      let typ = Ast.mk_any_bool ~pos:pos2 in
      let _ = UnionFind.merge (fun a _ -> a) typ u2 in
      return ()
  | ty1, ty2 when Ast.is_bool ty1 && Ast.is_bool ty2 ->
      return ()
  (* Check Strings *)
  | Ast.Any _, ty when Ast.is_specialized_string ty ->
      let typ = Ast.mk_any_string ~pos:pos1 in
      let _ = UnionFind.merge (fun a _ -> a) typ u1 in
      return ()
  | ty, Ast.Any _ when Ast.is_specialized_string ty ->
      let typ = Ast.mk_any_string ~pos:pos2 in
      let _ = UnionFind.merge (fun a _ -> a) typ u2 in
      return ()
  | ty, ty2 when Ast.is_string ty && Ast.is_string ty2 ->
      return ()
  (* Check Dates *)
  | Ast.Any _, ty when Ast.is_specialized_date ty ->
      let typ = Ast.mk_any_date ~pos:pos1 in
      let _ = UnionFind.merge (fun a _ -> a) typ u1 in
      return ()
  | ty, Ast.Any _ when Ast.is_specialized_date ty ->
      let typ = Ast.mk_any_date ~pos:pos2 in
      let _ = UnionFind.merge (fun a _ -> a) typ u2 in
      return ()
  | ty1, ty2 when Ast.is_date ty1 && Ast.is_date ty2 ->
      return ()
  (* Enumerate symbols *)
  | Ast.Any _, Ast.Literal ((LSymbol _, _) as literal) ->
      let typ = Ast.TEnum [literal] in
      let _ = UnionFind.set u1 (Mark.mk_pos ~pos:pos1 typ) in
      return ()
  | Ast.Literal ((LSymbol _, _) as literal), Ast.Any _ ->
      let typ = Ast.TEnum [literal] in
      let _ = UnionFind.set u2 (Mark.mk_pos ~pos:pos2 typ) in
      return ()
  | Ast.Any _, TEnum ((LSymbol _, _) :: _) ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  | TEnum ((LSymbol _, _) :: _), Ast.Any _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  | ( TEnum ((LSymbol _, _) :: _ as symbols)
    , Ast.Literal ((LSymbol _, _) as literal) ) ->
      let typ = Ast.TEnum (literal :: symbols) in
      let _ = UnionFind.set u1 (Mark.mk_pos ~pos:pos1 typ) in
      return ()
  | ( Ast.Literal ((LSymbol _, _) as literal)
    , TEnum ((LSymbol _, _) :: _ as symbols) ) ->
      let typ = Ast.TEnum (literal :: symbols) in
      let _ = UnionFind.set u2 (Mark.mk_pos ~pos:pos2 typ) in
      return ()
  (* Check symbols *)
  | Ast.Literal (LSymbol s1, _), Ast.Literal (LSymbol s2, _) ->
      if String.equal s1 s2 then return () else error_typ_mismatch u1 u2
  (* Check Enums (second fit in first) *)
  | TEnum (_ as lits1), TEnum (_ as lits2) ->
      let* _ =
        match (lits1, lits2) with
        | (LNumber (_, u1), _) :: _, (LNumber (_, u2), _) :: _ ->
            Number_unit.unify ~pos1 ~pos2 u1 u2
        | _, _ ->
            return ()
      in
      (* TODO: unify numbers *)
      let missing =
        List.filter lits2 ~f:(fun (lit2, _) ->
            List.exists lits1 ~f:(fun (lit1, _) -> Ast.equal_literal lit1 lit2)
            |> not )
      in
      if List.is_empty missing then return ()
      else error_missing_enums missing u1 u2
  | _, _ ->
      error_typ_mismatch u1 u2

let get_number_unit_opt = function
  | Ast.Literal (LNumber (_, unit), _) ->
      Some unit
  | Ast.TNumber unit ->
      Some unit
  | Ast.Any_number unit ->
      Some unit
  | TEnum ((LNumber (_, unit), _) :: _) ->
      Some unit
  | _ ->
      None

let check_multiply ~pos u1 u2 : Ast.typ Output.t =
  let t1, _ = UnionFind.get u1 in
  let t2, _ = UnionFind.get u2 in
  match (get_number_unit_opt t1, get_number_unit_opt t2) with
  | Some unit1, Some unit2 ->
      let t = Number_unit.multiply unit1 unit2 in
      let m = Ast.mk ~pos (TNumber t) in
      return m
  | _, _ ->
      let msg1 = Ast.to_string ~sep:", " t1 in
      let msg2 = Ast.to_string ~sep:", " t2 in
      let msg = Stdlib.Format.asprintf "Can't multiply '%s' '%s'" msg1 msg2 in
      failwith msg

let check_divide ~pos u1 u2 : Ast.typ Output.t =
  let t1, _ = UnionFind.get u1 in
  let t2, _ = UnionFind.get u2 in
  match (get_number_unit_opt t1, get_number_unit_opt t2) with
  | Some unit1, Some unit2 ->
      let t = Number_unit.divide unit1 unit2 in
      let m = Ast.mk ~pos (TNumber t) in
      return m
  | _, _ ->
      let msg1 = Ast.to_string ~sep:", " t1 in
      let msg2 = Ast.to_string ~sep:", " t2 in
      let msg = Stdlib.Format.asprintf "Can't divide '%s' '%s'" msg1 msg2 in
      failwith msg

let check_enumerate ~pos u1 u2 : Ast.typ Output.t =
  let t1, {Mark.pos= pos1} = UnionFind.get u1 in
  let t2, {Mark.pos= pos2} = UnionFind.get u2 in
  match (t1, t2) with
  (* Merge Anys *)
  | Ast.Any _, Ast.Any _ ->
      (* Merge them *)
      let _ = UnionFind.union u1 u2 in
      return u1
  (* Numbers *)
  (* Merge them *)
  | Ast.Any_number unit1, Ast.Any_number unit2 ->
      let* _ = Number_unit.unify ~pos1 ~pos2 unit1 unit2 in
      let _ = UnionFind.union u1 u2 in
      return u1
  (* Generalize the other side *)
  | Ast.Any _, Ast.TNumber _ | Ast.Any _, Ast.Any_number _ ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return u1
  | Ast.TNumber _, Ast.Any _ | Ast.Any_number _, Ast.Any _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return u2
  (* Start enumerating *)
  | Ast.Any _, Ast.Literal ((LNumber _, _) as literal)
  | Ast.Any_number _, Ast.Literal ((LNumber _, _) as literal) ->
      let enum = Ast.mk_enum ~pos [literal] in
      return enum
  | Ast.Literal ((LNumber _, _) as literal), Ast.Any _
  | Ast.Literal ((LNumber _, _) as literal), Ast.Any_number _ ->
      let enum = Ast.mk_enum ~pos [literal] in
      return enum
  | ( Ast.Literal ((LNumber (_, u1), _) as l1)
    , Ast.Literal ((LNumber (_, u2), _) as l2) ) ->
      let* _ = Number_unit.unify ~pos1 ~pos2 u1 u2 in
      let enum = Ast.mk_enum ~pos [l1; l2] in
      return enum
  | Ast.Any _, TEnum ((LNumber _, _) :: _ as literals)
  | Ast.Any_number _, TEnum ((LNumber _, _) :: _ as literals)
  | TEnum ((LNumber _, _) :: _ as literals), Ast.Any _
  | TEnum ((LNumber _, _) :: _ as literals), Ast.Any_number _ ->
      let enum = Ast.mk_enum ~pos literals in
      return enum
  (* Fill *)
  | ( TEnum ((LNumber (_, u1), _) :: _ as literals)
    , Ast.Literal ((LNumber (_, u2), _) as literal) )
  | ( Ast.Literal ((LNumber (_, u2), _) as literal)
    , TEnum ((LNumber (_, u1), _) :: _ as literals) ) ->
      let* _ = Number_unit.unify ~pos1 ~pos2 u1 u2 in
      let enum = Ast.mk_enum ~pos (literal :: literals) in
      return enum
  | ( TEnum ((LNumber (_, u1), _) :: _ as lits1)
    , TEnum ((LNumber (_, u2), _) :: _ as lits2) ) ->
      let* _ = Number_unit.unify ~pos1 ~pos2 u1 u2 in
      let enum = Ast.mk_enum ~pos (lits1 @ lits2) in
      return enum
  (* Generalize *)
  | TEnum ((LNumber (_, u1), _) :: _), Ast.TNumber u2
  | Ast.TNumber u1, TEnum ((LNumber (_, u2), _) :: _)
  | Ast.Literal (LNumber (_, u1), _), Ast.TNumber u2
  | Ast.TNumber u1, Ast.Literal (LNumber (_, u2), _)
  | Ast.TNumber u1, Ast.TNumber u2 ->
      let* _ = Number_unit.unify ~pos1 ~pos2 u1 u2 in
      let typ = Ast.mk ~pos (TNumber u1) in
      return typ
  (* Strings *)
  (* Merge them *)
  | Ast.Any_string _, Ast.Any_string _ ->
      let _ = UnionFind.union u1 u2 in
      return u1
  (* Generalize the other side *)
  | Ast.Any _, Ast.TString | Ast.Any_string _, Ast.TString ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return u1
  | Ast.TString, Ast.Any _ | Ast.TString, Ast.Any_string _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return u2
  (* Start enumerating *)
  | Ast.Any _, Ast.Literal ((LString _, _) as literal)
  | Ast.Any_string _, Ast.Literal ((LString _, _) as literal) ->
      let enum = Ast.mk_enum ~pos [literal] in
      return enum
  | Ast.Literal ((LString _, _) as literal), Ast.Any _
  | Ast.Literal ((LString _, _) as literal), Ast.Any_string _ ->
      let enum = Ast.mk_enum ~pos [literal] in
      return enum
  | Ast.Literal ((LString _, _) as l1), Ast.Literal ((LString _, _) as l2) ->
      let enum = Ast.mk_enum ~pos [l1; l2] in
      return enum
  | Ast.Any _, TEnum ((LString _, _) :: _ as literals)
  | Ast.Any_string _, TEnum ((LString _, _) :: _ as literals)
  | TEnum ((LString _, _) :: _ as literals), Ast.Any _
  | TEnum ((LString _, _) :: _ as literals), Ast.Any_string _ ->
      let enum = Ast.mk_enum ~pos literals in
      return enum
  (* Fill *)
  | ( TEnum ((LString _, _) :: _ as literals)
    , Ast.Literal ((LString _, _) as literal) )
  | ( Ast.Literal ((LString _, _) as literal)
    , TEnum ((LString _, _) :: _ as literals) ) ->
      let enum = Ast.mk_enum ~pos (literal :: literals) in
      return enum
  | TEnum ((LString _, _) :: _ as lits1), TEnum ((LString _, _) :: _ as lits2)
    ->
      let enum = Ast.mk_enum ~pos (lits1 @ lits2) in
      return enum
  (* Generalize *)
  | TEnum ((LString _, _) :: _), Ast.TString
  | Ast.TString, TEnum ((LString _, _) :: _)
  | Ast.Literal (LString _, _), Ast.TString
  | Ast.TString, Ast.Literal (LString _, _)
  | Ast.TString, Ast.TString ->
      let typ = Ast.mk ~pos TString in
      return typ
  (* Bools *)
  (* Merge them *)
  | Ast.Any_bool _, Ast.Any_bool _ ->
      let _ = UnionFind.union u1 u2 in
      return u1
  (* Generalize the other side *)
  | Ast.Any _, Ast.TBool | Ast.Any_bool _, Ast.TBool ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return u1
  | Ast.TBool, Ast.Any _ | Ast.TBool, Ast.Any_bool _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return u2
  (* Start enumerating *)
  | Ast.Any _, Ast.Literal ((LBool _, _) as literal)
  | Ast.Any_bool _, Ast.Literal ((LBool _, _) as literal) ->
      let enum = Ast.mk_enum ~pos [literal] in
      return enum
  | Ast.Literal ((LBool _, _) as literal), Ast.Any _
  | Ast.Literal ((LBool _, _) as literal), Ast.Any_bool _ ->
      let enum = Ast.mk_enum ~pos [literal] in
      return enum
  | Ast.Literal ((LBool _, _) as l1), Ast.Literal ((LBool _, _) as l2) ->
      let enum = Ast.mk_enum ~pos [l1; l2] in
      return enum
  | Ast.Any _, TEnum ((LBool _, _) :: _ as literals)
  | Ast.Any_bool _, TEnum ((LBool _, _) :: _ as literals)
  | TEnum ((LBool _, _) :: _ as literals), Ast.Any _
  | TEnum ((LBool _, _) :: _ as literals), Ast.Any_bool _ ->
      let enum = Ast.mk_enum ~pos literals in
      return enum
  (* Fill *)
  | TEnum ((LBool _, _) :: _ as literals), Ast.Literal ((LBool _, _) as literal)
  | Ast.Literal ((LBool _, _) as literal), TEnum ((LBool _, _) :: _ as literals)
    ->
      let enum = Ast.mk_enum ~pos (literal :: literals) in
      return enum
  | TEnum ((LBool _, _) :: _ as lits1), TEnum ((LBool _, _) :: _ as lits2) ->
      let enum = Ast.mk_enum ~pos (lits1 @ lits2) in
      return enum
  (* Generalize *)
  | TEnum ((LBool _, _) :: _), Ast.TBool
  | Ast.TBool, TEnum ((LBool _, _) :: _)
  | Ast.Literal (LBool _, _), Ast.TBool
  | Ast.TBool, Ast.Literal (LBool _, _)
  | Ast.TBool, Ast.TBool ->
      let typ = Ast.mk ~pos TBool in
      return typ
  (* Dates *)
  (* Merge them *)
  | Ast.Any_date _, Ast.Any_date _ ->
      let _ = UnionFind.union u1 u2 in
      return u1
  (* Generalize the other side *)
  | Ast.Any _, Ast.TDate | Ast.Any_date _, Ast.TDate ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return u1
  | Ast.TDate, Ast.Any _ | Ast.TDate, Ast.Any_date _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return u2
  (* Start enumerating *)
  | Ast.Any _, Ast.Literal ((LDate _, _) as literal)
  | Ast.Any_date _, Ast.Literal ((LDate _, _) as literal) ->
      let enum = Ast.mk_enum ~pos [literal] in
      return enum
  | Ast.Literal ((LDate _, _) as literal), Ast.Any _
  | Ast.Literal ((LDate _, _) as literal), Ast.Any_date _ ->
      let enum = Ast.mk_enum ~pos [literal] in
      return enum
  | Ast.Literal ((LDate _, _) as l1), Ast.Literal ((LDate _, _) as l2) ->
      let enum = Ast.mk_enum ~pos [l1; l2] in
      return enum
  | Ast.Any _, TEnum ((LDate _, _) :: _ as literals)
  | Ast.Any_date _, TEnum ((LDate _, _) :: _ as literals)
  | TEnum ((LDate _, _) :: _ as literals), Ast.Any _
  | TEnum ((LDate _, _) :: _ as literals), Ast.Any_date _ ->
      let enum = Ast.mk_enum ~pos literals in
      return enum
  (* Fill *)
  | TEnum ((LDate _, _) :: _ as literals), Ast.Literal ((LDate _, _) as literal)
  | Ast.Literal ((LDate _, _) as literal), TEnum ((LDate _, _) :: _ as literals)
    ->
      let enum = Ast.mk_enum ~pos (literal :: literals) in
      return enum
  | TEnum ((LDate _, _) :: _ as lits1), TEnum ((LDate _, _) :: _ as lits2) ->
      let enum = Ast.mk_enum ~pos (lits1 @ lits2) in
      return enum
  (* Generalize *)
  | TEnum ((LDate _, _) :: _), Ast.TDate
  | Ast.TDate, TEnum ((LDate _, _) :: _)
  | Ast.Literal (LDate _, _), Ast.TDate
  | Ast.TDate, Ast.Literal (LDate _, _)
  | Ast.TDate, Ast.TDate ->
      let typ = Ast.mk ~pos TDate in
      return typ
  (* Symbols *)
  (* Start enumerating *)
  | Ast.Any _, Ast.Literal ((LSymbol _, _) as l1)
  | Ast.Literal ((LSymbol _, _) as l1), Ast.Any _ ->
      let enum = Ast.mk_enum ~pos [l1] in
      return enum
  | Ast.Literal ((LSymbol _, _) as l1), Ast.Literal ((LSymbol _, _) as l2) ->
      let enum = Ast.mk_enum ~pos [l1; l2] in
      return enum
  (* Fill *)
  | ( TEnum ((LSymbol _, _) :: _ as literals)
    , Ast.Literal ((LSymbol _, _) as literal) )
  | ( Ast.Literal ((LSymbol _, _) as literal)
    , TEnum ((LSymbol _, _) :: _ as literals) ) ->
      let enum = Ast.mk_enum ~pos (literal :: literals) in
      return enum
  | TEnum ((LSymbol _, _) :: _ as lits1), TEnum ((LSymbol _, _) :: _ as lits2)
    ->
      let enum = Ast.mk_enum ~pos (lits1 @ lits2) in
      return enum
  | _, _ ->
      error_typ_mismatch u1 u2

let rec check_expression ~replaces ~current ~(ast : Ast.typing_tree) ~contexts
    ~(ptyp : Ast.typ) (expr : Ast.typing_expr) : unit Output.t =
  let check_expression = check_expression ~replaces ~current ~ast ~contexts in
  let expr, mark = expr in
  let pos = mark.pos in
  let* _ =
    match expr with
    | Const _ ->
        let* _ = check_union mark.typ ptyp in
        return ()
    | Ref ref ->
        let* _ =
          let* value =
            match Hashtbl.find contexts ref with
            | Some value ->
                return value
            | None ->
                let rule_def, status = Hashtbl.find_exn ast ref in
                let* _ =
                  match status with
                  | Todo ->
                      check_rule_def ~replaces ~ast ~contexts rule_def
                  | Error ->
                      empty
                  | _ ->
                      return ()
                in
                let {Shared_ast.value; _} = rule_def in
                return value
          in
          let _, mark = value in
          let replacements =
            Replacement_graph.find_transitive_replacements ~from:current
              ~rule:ref replaces
            |> List.map ~f:fst
          in
          let* typ =
            Output.fold replacements ~init:mark.typ ~f:(fun ptyp ref ->
                let rule_def, status = Hashtbl.find_exn ast ref in
                let* _ =
                  match status with
                  | Todo ->
                      check_rule_def ~replaces ~ast ~contexts rule_def
                  | Error ->
                      empty
                  | _ ->
                      return ()
                in
                let {Shared_ast.value; _} = rule_def in
                let _, mark = value in
                check_enumerate ~pos ptyp mark.typ )
          in
          let* _ = check_union typ ptyp in
          return ()
        in
        let* _ = check_union mark.typ ptyp in
        return ()
    | Binary_op (op, ((_, left_mark) as left), ((_, right_mark) as right)) -> (
        let {Ast.pos= left_pos; _} = left_mark in
        let {Ast.pos= right_pos; _} = right_mark in
        match fst op with
        | And | Or ->
            let* _ = Ast.mk_bool ~pos |> check_union mark.typ in
            let* _ = check_expression ~ptyp:mark.typ left in
            let* _ = check_expression ~ptyp:mark.typ right in
            let* _ = check_union mark.typ ptyp in
            return ()
        | Add | Sub | Max | Min ->
            (* check both are any number, and unify units *)
            let* left =
              let wip = Ast.mk_any_number ~pos:left_pos in
              let* _ = check_expression ~ptyp:wip left in
              return wip
            in
            let* right =
              let wip = Ast.mk_any_number ~pos:right_pos in
              let* _ = check_expression ~ptyp:wip right in
              return wip
            in
            let* _ = check_generalize left right in
            let wip = Ast.mk_number_no_unit ~pos in
            let* _ = check_union left wip in
            let* _ = check_union wip mark.typ in
            let* _ = check_union mark.typ ptyp in
            return ()
        | Mul ->
            (* check both are any number *)
            let* _ =
              let wip = Ast.mk_any_number ~pos:left_pos in
              check_expression ~ptyp:wip left
            in
            let* _ =
              let wip = Ast.mk_any_number ~pos:right_pos in
              check_expression ~ptyp:wip right
            in
            (* we are TNumber *)
            let* wip = check_multiply ~pos left_mark.typ right_mark.typ in
            (* apply to union *)
            let* _ = check_union mark.typ wip in
            (* check against ptyp *)
            let* _ = check_union mark.typ ptyp in
            return ()
        | Div ->
            (* check both are any number *)
            let* _ =
              let wip = Ast.mk_any_number ~pos:left_pos in
              check_expression ~ptyp:wip left
            in
            let* _ =
              let wip = Ast.mk_any_number ~pos:right_pos in
              check_expression ~ptyp:wip right
            in
            (* we are TNumber *)
            let* wip = check_divide ~pos left_mark.typ right_mark.typ in
            (* apply to mark *)
            let* _ = check_union mark.typ wip in
            (* check against ptyp *)
            let* _ = check_union mark.typ ptyp in
            return ()
        | Pow ->
            (* check both are any number *)
            let* wip1 =
              let wip = Ast.mk_any_number ~pos:left_pos in
              let* _ = check_expression ~ptyp:wip left in
              return wip
            in
            let* _ =
              let wip = Ast.mk_any_number ~pos:right_pos in
              check_expression ~ptyp:wip right
            in
            (* we are TNumber *)
            let wip2 = Ast.mk_number_no_unit ~pos in
            (* gather unit *)
            let* _ = check_union wip1 wip2 in
            let* _ = check_union wip2 mark.typ in
            return ()
        | Gt | Lt | GtEq | LtEq | Eq | NotEq ->
            let* left =
              let wip = Ast.mk_any ~pos:left_pos in
              let* _ = check_expression ~ptyp:wip left in
              return wip
            in
            let* right =
              let wip = Ast.mk_any ~pos:right_pos in
              let* _ = check_expression ~ptyp:wip right in
              return wip
            in
            (* TODO: restrict possible types? *)
            let* _ = check_generalize left right in
            let wip = Ast.mk_bool ~pos in
            let* _ = check_union wip ptyp in
            return () )
    | Unary_op ((Neg, _), expr) ->
        (* check is a number *)
        let wip1 = Ast.mk_any_number ~pos in
        let* _ = check_expression ~ptyp:wip1 expr in
        (* we are TNumber *)
        let wip2 = Ast.mk_number_no_unit ~pos in
        (* gather unit *)
        let* _ = check_union wip1 wip2 in
        (* merge *)
        let* _ = check_union mark.typ wip2 in
        (* check against ptyp *)
        let* _ = check_union mark.typ ptyp in
        return ()
  in
  return ()

and check_value_mechanism ~replaces ~current ~(ast : Ast.typing_tree) ~contexts
    (value : Ast.typing_marked_value_mechanism) : unit Output.t =
  let check_value = check_value ~replaces ~current ~ast ~contexts in
  let value, mark = value in
  let pos = mark.pos in
  let* _ =
    match value with
    | Expr expr ->
        let* _ =
          check_expression ~replaces ~current ~ast ~contexts ~ptyp:mark.typ expr
        in
        return ()
    | Value value ->
        let* _ = check_value ~ptyp:mark.typ value in
        return ()
    | Is_applicable _ | Is_not_applicable _ ->
        (* TODO: handle this when Not_applicable is a type *)
        return ()
    | Sum values | Min_of values | Max_of values ->
        (* check all number *)
        let* _ =
          match values with
          | [] ->
              return ()
          | hd :: rest ->
              let* init =
                let wip = Ast.mk_any_number ~pos in
                let* _ = check_value ~ptyp:wip hd in
                return wip
              in
              let* _ =
                Output.fold ~init rest ~f:(fun wip value ->
                    let* _ = check_value ~ptyp:wip value in
                    return wip )
              in
              return ()
        in
        (* we are TNumber *)
        let wip = Ast.mk_number_no_unit ~pos in
        (* gather unit *)
        let* _ =
          List.map values ~f:(fun (_, value) -> check_union wip value.typ)
          |> all_okay
        in
        let* _ = check_union wip mark.typ in
        return ()
    | Product values ->
        let* _ =
          List.map values ~f:(fun value ->
              let wip = Ast.mk_any_number ~pos in
              check_value ~ptyp:wip value )
          |> all_okay
        in
        let* wip =
          match values with
          | [] ->
              failwith "reachable?"
          | hd :: rest ->
              let* init =
                let wip = Ast.mk_any_number ~pos in
                let* _ = check_value ~ptyp:wip hd in
                return wip
              in
              Output.fold ~init rest ~f:(fun wip value ->
                  check_multiply ~pos wip (Mark.get value).typ )
        in
        let* _ = check_union wip mark.typ in
        return ()
    | All_of values | One_of values ->
        let* _ =
          List.map values ~f:(fun value ->
              let wip = Ast.mk_any_bool ~pos in
              check_value ~ptyp:wip value )
          |> all_okay
        in
        let wip = Ast.mk_bool ~pos in
        let* _ = check_union wip mark.typ in
        return ()
    | Not_defined ->
        return ()
    | Variations (variations, value) ->
        let wip = Ast.mk_any ~pos in
        let* wip =
          Output.fold ~init:wip variations ~f:(fun wip {if_; then_} ->
              let* _ =
                let wip2 = Ast.mk_any_bool ~pos in
                check_value ~ptyp:wip2 if_
              in
              let wip2 = Ast.mk_any ~pos in
              let* _ = check_value ~ptyp:wip2 then_ in
              check_enumerate ~pos wip wip2 )
        in
        let* wip =
          match value with
          | None ->
              return wip
          | Some else_ ->
              let wip2 = Ast.mk_any ~pos in
              let* _ = check_value ~ptyp:wip2 else_ in
              check_enumerate ~pos wip wip2
        in
        let* _ = check_union wip mark.typ in
        return ()
  in
  return ()

and check_chainable_mechanism ~replaces ~current ~(ast : Ast.typing_tree)
    ~contexts ~(ptyp : Ast.typ)
    (chainable : Ast.typing_marked_chainable_mechanism) : unit Output.t =
  let check_value = check_value ~replaces ~current ~ast ~contexts in
  let chainable, mark = chainable in
  let pos = mark.pos in
  let* _ =
    match chainable with
    | Context _ ->
        (* already done in check_contexts *)
        let* _ = check_union mark.typ ptyp in
        return ()
    | Applicable_if value | Not_applicable_if value ->
        let* _ =
          let wip = Ast.mk_any_bool ~pos in
          check_value ~ptyp:wip value
        in
        let* _ = check_union mark.typ ptyp in
        return ()
    | Type (typ, {Mark.pos}) ->
        let wip = Ast.mk_typ ~pos typ in
        let* _ = check_generalize wip ptyp in
        let* _ = check_union wip mark.typ in
        return ()
    | Default value ->
        let wip = Ast.mk_any ~pos in
        let* _ = check_value ~ptyp:wip value in
        let* wip = check_enumerate ~pos wip ptyp in
        let* _ = check_union wip mark.typ in
        let* _ = check_union mark.typ ptyp in
        return ()
    | Ceiling value | Floor value ->
        let* wip =
          let wip = Ast.mk_any_number ~pos in
          let* _ = check_value ~ptyp:wip value in
          return wip
        in
        let* _ = check_union wip mark.typ in
        let* _ = check_union mark.typ ptyp in
        return ()
    | Round (_, value) ->
        let* _ = check_value value in
        let _, value_mark = value in
        let typ, {Mark.pos} = UnionFind.get value_mark.typ in
        let wip = Ast.mk_number_no_unit ~pos in
        let* _ =
          if Ast.is_bool typ then return ()
          else
            match get_number_unit_opt typ with
            | Some unit ->
                let concrete = Number_unit.to_concrete unit in
                if Units.equal concrete (Units.parse_unit "décimales") then
                  return ()
                else check_union value_mark.typ wip
            | None ->
                let hints = ["arrondi doit être un nombre ou un booléen"] in
                error_typ_invalid ~hints value_mark.typ
        in
        let* _ = check_union wip mark.typ in
        let* _ = check_union mark.typ ptyp in
        return ()
  in
  return ()

(* Also fill contexts *)
and check_contexts ~replaces ~current
    ~(contexts : Ast.typing_value Rule_name.Hashtbl.t) ~(ast : Ast.typing_tree)
    (chainables : Ast.typing_marked_chainable_mechanism list) : unit Output.t =
  let check_context_entry ref_name value =
    let* cont_typ =
      let rule_def, status = Hashtbl.find_exn ast ref_name in
      let* _ =
        if Ast.is_todo status then
          check_rule_def ~replaces ~ast ~contexts rule_def
        else return ()
      in
      let {Shared_ast.value; _} = rule_def in
      let _, cont_mark = value in
      return cont_mark.typ
    in
    let* val_typ =
      let* _ = check_value ~replaces ~current ~ast ~contexts value in
      let _, value_mark = value in
      return value_mark.typ
    in
    let* _ = check_generalize cont_typ val_typ in
    Hashtbl.set contexts ~key:ref_name ~data:value ;
    return ()
  in
  let* _ =
    List.map chainables ~f:(fun (chainable, _) ->
        match chainable with
        | Context values ->
            let* _ =
              all_okay
                (List.map values ~f:(fun ((ref, _), value) ->
                     check_context_entry ref value ) )
            in
            return ()
        | _ ->
            return () )
    |> all_okay
  in
  return ()

and check_value ~replaces ~current ~(ast : Ast.typing_tree) ~contexts ?ptyp
    (value : Ast.typing_value) : unit Output.t =
  let {Shared_ast.value; chainable_mechanisms}, root = value in
  let* _ =
    check_contexts ~replaces ~current ~contexts ~ast chainable_mechanisms
  in
  let* _ = check_value_mechanism ~replaces ~current ~ast ~contexts value in
  let _, mark = value in
  let* typ =
    List.sort chainable_mechanisms ~compare:(fun (a, _) (b, _) ->
        Shared_ast.compare_chainable_mechanism Shared.Rule_name.compare
          Ast.compare_typing_mark a b )
    |> Output.fold ~init:mark.typ ~f:(fun ptyp chainable ->
        let* _ =
          check_chainable_mechanism ~replaces ~current ~ast ~contexts ~ptyp
            chainable
        in
        let _, mark = chainable in
        return mark.typ )
  in
  let* _ = check_union typ root.typ in
  let* _ =
    match ptyp with
    | None ->
        return ()
    | Some ptyp ->
        let* _ = check_union mark.typ ptyp in
        return ()
  in
  return ()

and check_rule_def ~replaces ~(ast : Ast.typing_tree) ?contexts
    (rule_def : Ast.typing_rule_def) : unit Output.t =
  let rule_name = Mark.remove rule_def.name in
  let _, typing_state = Hashtbl.find_exn ast rule_name in
  if not (Ast.is_todo typing_state) then return ()
  else (
    Ast.set_typing_state ast rule_def Ast.Doing ;
    let contexts =
      match contexts with
      | None ->
          Hashtbl.create (module Shared.Rule_name) ~growth_allowed:true
      | Some contexts ->
          contexts
    in
    let {Shared_ast.value; name= current, _; _} = rule_def in
    let res =
      let* _ = check_value ~replaces ~current ~ast ~contexts value in
      let _, mark = value in
      (* TODO: better pos to notice this? *)
      match List.hd rule_def.make_not_applicable with
      | None ->
          return ()
      | Some hd ->
          let typ = Ast.mk_any_bool ~pos:(Mark.pos hd.reference) in
          check_union typ mark.typ
    in
    match res with
    | None, logs ->
        Ast.set_typing_state ast rule_def Ast.Error ;
        break ~logs ()
    | Some _, logs ->
        Ast.set_typing_state ast rule_def Ast.Done ;
        break ~logs () )

let type_check ~replaces (ast : Ast.typing_tree) : unit Output.t =
  let* _ =
    Hashtbl.to_alist ast |> List.map ~f:snd
    |> List.sort
         ~compare:(fun
             ({Shared_ast.name= _, {Mark.pos= p1}; _}, _)
             ({Shared_ast.name= _, {Mark.pos= p2}; _}, _)
           -> Pos.compare p1 p2 )
    |> List.map ~f:(fun (rule_def, status) ->
        if Ast.is_todo status then check_rule_def ~replaces ~ast rule_def
        else return () )
    |> all_okay
  in
  return ()
