open Base
open Shared
open Utils
open Output

let to_label (mark : Ast.typ) =
  match mark.typ with
  | TEnum enum ->
      let msg =
        Ast.to_string ~sep:", " mark.typ |> Stdlib.Format.asprintf "est %s"
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
      Mark.mk_pos ~pos:mark.pos msg :: msgs
  | _ ->
      let msg =
        Ast.to_string ~sep:", " mark.typ |> Stdlib.Format.asprintf "est %s"
      in
      [Mark.mk_pos ~pos:mark.pos msg]

let to_labels (u1 : Ast.wip_mark) (u2 : Ast.wip_mark) =
  [u1; u2] |> List.map ~f:UnionFind.get
  |> List.sort ~compare:(fun {Ast.pos= p1; _} {Ast.pos= p2; _} ->
      Pos.compare p1 p2 )
  |> List.map ~f:to_label |> List.concat

let error_typ_mismatch (u1 : Ast.wip_mark) (u2 : Ast.wip_mark) =
  let m1 = UnionFind.get u1 in
  let _m2 = UnionFind.get u2 in
  let code, message = Err.type_incoherence in
  let labels = to_labels u1 u2 in
  fatal_error ~pos:m1.pos ~kind:`Type ~code ~labels message

let error_typ_invalid ?(hints = []) (u1 : Ast.wip_mark) =
  let m1 = UnionFind.get u1 in
  let code, message = Err.type_invalid_type in
  let labels = to_label m1 in
  fatal_error ~pos:m1.pos ~hints ~kind:`Type ~code ~labels message

let error_missing_enums enums (u1 : Ast.wip_mark) (u2 : Ast.wip_mark) =
  let m1 = UnionFind.get u1 in
  let _m2 = UnionFind.get u2 in
  let enums =
    Ast.sort_enum enums |> List.map ~f:fst |> List.map ~f:Ast.literal_to_string
  in
  let code, message = Err.type_missing_enums enums in
  let labels = to_labels u1 u2 in
  fatal_error ~pos:m1.pos ~kind:`Type ~code ~labels message

(* TODO: pass pos and add a lavel error here *)
let check_union (u1 : Ast.wip_mark) (u2 : Ast.wip_mark) : unit Output.t =
  let m1 = UnionFind.get u1 in
  let m2 = UnionFind.get u2 in
  let {Ast.pos= pos1; typ= t1} = m1 in
  let {Ast.pos= pos2; typ= t2} = m2 in
  match (t1, t2) with
  (* Merge Anys *)
  | Ast.Any _, Ast.Any _ ->
      (* Merge them *)
      let _ = UnionFind.union u1 u2 in
      return ()
  | Ast.Any _, _ ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  | _, Ast.Any _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
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
  (* Check Any Bool *)
  | Ast.Any_bool _, Ast.Any_bool _ ->
      (* Merge them *)
      let _ = UnionFind.union u1 u2 in
      return ()
  | Ast.Literal (LBool _, _), Ast.Any_bool _
  | TBool, Ast.Any_bool _
  | TEnum ((LBool _, _) :: _), Ast.Any_bool _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  | Ast.Any_bool _, Ast.Literal (LBool _, _)
  | Ast.Any_bool _, TBool
  | Ast.Any_bool _, TEnum ((LBool _, _) :: _) ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  (* Check Any String *)
  | Ast.Any_string _, Ast.Any_string _ ->
      (* Merge them *)
      let _ = UnionFind.union u1 u2 in
      return ()
  | Ast.Literal (LString _, _), Ast.Any_string _
  | TString, Ast.Any_string _
  | TEnum ((LString _, _) :: _), Ast.Any_string _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  | Ast.Any_string _, Ast.Literal (LString _, _)
  | Ast.Any_string _, TString
  | Ast.Any_string _, TEnum ((LString _, _) :: _) ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  (* Check Any Date *)
  | Ast.Any_date _, Ast.Any_date _ ->
      (* Merge them *)
      let _ = UnionFind.union u1 u2 in
      return ()
  | Ast.Literal (LDate _, _), Ast.Any_date _
  | TDate, Ast.Any_date _
  | TEnum ((LDate _, _) :: _), Ast.Any_date _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  | Ast.Any_date _, Ast.Literal (LDate _, _)
  | Ast.Any_date _, TDate
  | Ast.Any_date _, TEnum ((LDate _, _) :: _) ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  (* Check Strings *)
  | Ast.Literal (LString _, _), Ast.Literal (LString _, _)
  | Ast.TString, Ast.TString
  | Ast.TString, Ast.Literal (LString _, _)
  | Ast.Literal (LString _, _), Ast.TString
  | Ast.TEnum ((LString _, _) :: _), Ast.TString
  | Ast.TEnum ((LString _, _) :: _), Ast.Literal (LString _, _)
  | Ast.TString, Ast.TEnum ((LString _, _) :: _)
  | Ast.Literal (LString _, _), Ast.TEnum ((LString _, _) :: _) ->
      return ()
  (* Check Bools *)
  | Ast.Literal (LBool _, _), Ast.Literal (LBool _, _)
  | Ast.TBool, Ast.TBool
  | Ast.TBool, Ast.Literal (LBool _, _)
  | Ast.Literal (LBool _, _), Ast.TBool
  | TEnum ((LBool _, _) :: _), Ast.Literal (LBool _, _)
  | TEnum ((LBool _, _) :: _), Ast.TBool
  | Ast.Literal (LBool _, _), TEnum ((LBool _, _) :: _)
  | Ast.TBool, TEnum ((LBool _, _) :: _) ->
      return ()
  (* Check Date *)
  | Ast.Literal (LDate _, _), Ast.Literal (LDate _, _)
  | Ast.TDate, Ast.TDate
  | Ast.TDate, Ast.Literal (LDate _, _)
  | Ast.Literal (LDate _, _), Ast.TDate
  | Ast.TEnum ((LDate _, _) :: _), Ast.TDate
  | Ast.TEnum ((LDate _, _) :: _), Ast.Literal (LDate _, _)
  | Ast.TDate, Ast.TEnum ((LDate _, _) :: _)
  | Ast.Literal (LDate _, _), Ast.TEnum ((LDate _, _) :: _) ->
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
  | _, _ ->
      error_typ_mismatch u1 u2

(* checks but keeps the least precise side general *)
let check_generalize (u1 : Ast.wip_mark) (u2 : Ast.wip_mark) : unit Output.t =
  let m1 = UnionFind.get u1 in
  let m2 = UnionFind.get u2 in
  let {Ast.pos= pos1; typ= t1} = m1 in
  let {Ast.pos= pos2; typ= t2} = m2 in
  match (t1, t2) with
  (* Merge Anys *)
  | Ast.Any _, Ast.Any _
  | Ast.Any_bool _, Ast.Any_bool _
  | Ast.Any_string _, Ast.Any_string _
  | Ast.Any_date _, Ast.Any_date _ ->
      (* Merge them *)
      let _ = UnionFind.union u1 u2 in
      return ()
  | Ast.Any_number unit1, Ast.Any_number unit2 ->
      (* Merge them *)
      let* _ = Number_unit.unify ~pos1 ~pos2 unit1 unit2 in
      let _ = UnionFind.union u1 u2 in
      return ()
  | Ast.Any _, Ast.Any_number _
  | Ast.Any _, Ast.Any_bool _
  | Ast.Any _, Ast.Any_string _
  | Ast.Any _, Ast.Any_date _ ->
      let _ = UnionFind.merge (fun _ b -> b) u1 u2 in
      return ()
  | Ast.Any_number _, Ast.Any _
  | Ast.Any_bool _, Ast.Any _
  | Ast.Any_string _, Ast.Any _
  | Ast.Any_date _, Ast.Any _ ->
      let _ = UnionFind.merge (fun a _ -> a) u1 u2 in
      return ()
  (* Check Numbers *)
  | Ast.Any _, Ast.TNumber unit
  | Ast.Any _, Ast.Literal (LNumber (_, unit), _)
  | Ast.Any _, Ast.TEnum ((LNumber (_, unit), _) :: _) ->
      let typ = Ast.Any_number unit in
      let _ = UnionFind.set u1 {m1 with typ} in
      return ()
  | Ast.TNumber unit, Ast.Any _
  | Ast.Literal (LNumber (_, unit), _), Ast.Any _
  | Ast.TEnum ((LNumber (_, unit), _) :: _), Ast.Any _ ->
      let typ = Ast.Any_number unit in
      let _ = UnionFind.set u2 {m2 with typ} in
      return ()
  | Ast.Any_number unit1, Ast.Literal (LNumber (_, unit2), _)
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
  | Ast.Literal (LNumber (_, unit1), _), Ast.Literal (LNumber (_, unit2), _) ->
      (* Gather units, leave any_number alone *)
      let* _ = Number_unit.unify ~pos1 ~pos2 unit1 unit2 in
      return ()
  (* Check Bools *)
  | Ast.Any _, Ast.TBool
  | Ast.Any _, Ast.Literal (LBool _, _)
  | Ast.Any _, Ast.TEnum ((LBool _, _) :: _) ->
      let typ = Ast.mk_any_bool ~pos:pos1 in
      let _ = UnionFind.merge (fun a _ -> a) typ u1 in
      return ()
  | Ast.TBool, Ast.Any _
  | Ast.Literal (LBool _, _), Ast.Any _
  | Ast.TEnum ((LBool _, _) :: _), Ast.Any _ ->
      let typ = Ast.mk_any_bool ~pos:pos2 in
      let _ = UnionFind.merge (fun a _ -> a) typ u2 in
      return ()
  | Ast.Any_bool _, Ast.TBool
  | Ast.Any_bool _, Ast.Literal (LBool _, _)
  | Ast.Any_bool _, Ast.TEnum ((LBool _, _) :: _)
  | Ast.TBool, Ast.Any_bool _
  | Ast.Literal (LBool _, _), Ast.Any_bool _
  | Ast.TEnum ((LBool _, _) :: _), Ast.Any_bool _
  | Ast.TBool, Ast.Literal (LBool _, _)
  | Ast.Literal (LBool _, _), Ast.TBool
  | Ast.TBool, Ast.TEnum ((LBool _, _) :: _)
  | Ast.TEnum ((LBool _, _) :: _), Ast.TBool
  | Ast.Literal (LBool _, _), Ast.Literal (LBool _, _) ->
      (* Ok *)
      return ()
  (* Check Strings *)
  | Ast.Any _, Ast.TString
  | Ast.Any _, Ast.Literal (LString _, _)
  | Ast.Any _, Ast.TEnum ((LString _, _) :: _) ->
      let typ = Ast.mk_any_string ~pos:pos1 in
      let _ = UnionFind.merge (fun a _ -> a) typ u1 in
      return ()
  | Ast.TString, Ast.Any _
  | Ast.Literal (LString _, _), Ast.Any _
  | Ast.TEnum ((LString _, _) :: _), Ast.Any _ ->
      let typ = Ast.mk_any_string ~pos:pos2 in
      let _ = UnionFind.merge (fun a _ -> a) typ u2 in
      return ()
  | Ast.Any_string _, Ast.TString
  | Ast.Any_string _, Ast.Literal (LString _, _)
  | Ast.Any_string _, Ast.TEnum ((LString _, _) :: _)
  | Ast.TString, Ast.Any_string _
  | Ast.Literal (LString _, _), Ast.Any_string _
  | Ast.TEnum ((LString _, _) :: _), Ast.Any_string _
  | Ast.TString, Ast.Literal (LString _, _)
  | Ast.TString, Ast.TEnum ((LString _, _) :: _)
  | Ast.Literal (LString _, _), Ast.TString
  | Ast.TEnum ((LString _, _) :: _), Ast.TString
  | Ast.Literal (LString _, _), Ast.Literal (LString _, _) ->
      (* Ok *)
      return ()
  (* Enumerate symbols *)
  | Ast.Any _, Ast.Literal ((LSymbol _, _) as literal) ->
      let typ = Ast.TEnum [literal] in
      let _ = UnionFind.set u1 {m1 with typ} in
      return ()
  | Ast.Literal ((LSymbol _, _) as literal), Ast.Any _ ->
      let typ = Ast.TEnum [literal] in
      let _ = UnionFind.set u2 {m2 with typ} in
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
      let _ = UnionFind.set u1 {m1 with typ} in
      return ()
  | ( Ast.Literal ((LSymbol _, _) as literal)
    , TEnum ((LSymbol _, _) :: _ as symbols) ) ->
      let typ = Ast.TEnum (literal :: symbols) in
      let _ = UnionFind.set u2 {m2 with typ} in
      return ()
  (* Check symbols *)
  | Ast.Literal (LSymbol s1, _), Ast.Literal (LSymbol s2, _) ->
      if String.equal s1 s2 then return () else error_typ_mismatch u1 u2
  (* Check Dates *)
  | Ast.Any _, Ast.TDate
  | Ast.Any _, Ast.Literal (LDate _, _)
  | Ast.Any _, Ast.TEnum ((LDate _, _) :: _) ->
      let typ = Ast.mk_any_date ~pos:pos1 in
      let _ = UnionFind.merge (fun a _ -> a) typ u1 in
      return ()
  | Ast.TDate, Ast.Any _
  | Ast.Literal (LDate _, _), Ast.Any _
  | Ast.TEnum ((LDate _, _) :: _), Ast.Any _ ->
      let typ = Ast.mk_any_date ~pos:pos2 in
      let _ = UnionFind.merge (fun a _ -> a) typ u2 in
      return ()
  | Ast.Any_date _, Ast.TDate
  | Ast.Any_date _, Ast.Literal (LDate _, _)
  | Ast.Any_date _, Ast.TEnum ((LDate _, _) :: _)
  | Ast.TDate, Ast.Any_date _
  | Ast.Literal (LDate _, _), Ast.Any_date _
  | Ast.TEnum ((LDate _, _) :: _), Ast.Any_date _
  | Ast.TDate, Ast.Literal (LDate _, _)
  | Ast.Literal (LDate _, _), Ast.TDate
  | Ast.TDate, Ast.TEnum ((LDate _, _) :: _)
  | Ast.TEnum ((LDate _, _) :: _), Ast.TDate
  | Ast.Literal (LDate _, _), Ast.Literal (LDate _, _) ->
      (* Ok *)
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
  | _, _ ->
      error_typ_mismatch u1 u2

let check_multiply ~pos u1 u2 : Ast.wip_mark Output.t =
  let {Ast.typ= t1; _} = UnionFind.get u1 in
  let {Ast.typ= t2; _} = UnionFind.get u2 in
  match (t1, t2) with
  (* Check Number *)
  | Ast.Literal (LNumber (_, unit1), _), Ast.Literal (LNumber (_, unit2), _)
  | Ast.Literal (LNumber (_, unit1), _), Ast.TNumber unit2
  | Ast.TNumber unit1, Ast.Literal (LNumber (_, unit2), _)
  | Ast.TNumber unit1, Ast.TNumber unit2
  | Ast.Any_number unit1, Ast.Any_number unit2
  | Ast.Any_number unit1, Ast.Literal (LNumber (_, unit2), _)
  | Ast.Literal (LNumber (_, unit1), _), Ast.Any_number unit2
  | Ast.Any_number unit1, Ast.TNumber unit2
  | Ast.TNumber unit1, Ast.Any_number unit2
  | TEnum ((LNumber (_, unit1), _) :: _), Ast.Literal (LNumber (_, unit2), _)
  | TEnum ((LNumber (_, unit1), _) :: _), Ast.TNumber unit2
  | TEnum ((LNumber (_, unit1), _) :: _), Ast.Any_number unit2
  | Ast.Literal (LNumber (_, unit1), _), TEnum ((LNumber (_, unit2), _) :: _)
  | Ast.TNumber unit1, TEnum ((LNumber (_, unit2), _) :: _)
  | Ast.Any_number unit1, TEnum ((LNumber (_, unit2), _) :: _) ->
      let t = Number_unit.multiply unit1 unit2 in
      let m = Ast.mk ~pos (TNumber t) in
      return m
  | _, _ ->
      let msg1 = Ast.to_string ~sep:", " t1 in
      let msg2 = Ast.to_string ~sep:", " t2 in
      let msg = Stdlib.Format.asprintf "Can't multiply '%s' '%s'" msg1 msg2 in
      failwith msg

let check_divide ~pos u1 u2 : Ast.wip_mark Output.t =
  let {Ast.typ= t1; _} = UnionFind.get u1 in
  let {Ast.typ= t2; _} = UnionFind.get u2 in
  match (t1, t2) with
  (* Check Number *)
  | Ast.Literal (LNumber (_, unit1), _), Ast.Literal (LNumber (_, unit2), _)
  | Ast.Literal (LNumber (_, unit1), _), Ast.TNumber unit2
  | Ast.TNumber unit1, Ast.Literal (LNumber (_, unit2), _)
  | Ast.TNumber unit1, Ast.TNumber unit2
  | Ast.Any_number unit1, Ast.Any_number unit2
  | Ast.Any_number unit1, Ast.Literal (LNumber (_, unit2), _)
  | Ast.Literal (LNumber (_, unit1), _), Ast.Any_number unit2
  | Ast.Any_number unit1, Ast.TNumber unit2
  | Ast.TNumber unit1, Ast.Any_number unit2
  | TEnum ((LNumber (_, unit1), _) :: _), Ast.Literal (LNumber (_, unit2), _)
  | TEnum ((LNumber (_, unit1), _) :: _), Ast.TNumber unit2
  | TEnum ((LNumber (_, unit1), _) :: _), Ast.Any_number unit2
  | Ast.Literal (LNumber (_, unit1), _), TEnum ((LNumber (_, unit2), _) :: _)
  | Ast.TNumber unit1, TEnum ((LNumber (_, unit2), _) :: _)
  | Ast.Any_number unit1, TEnum ((LNumber (_, unit2), _) :: _) ->
      let t = Number_unit.divide unit1 unit2 in
      let m = Ast.mk ~pos (TNumber t) in
      return m
  | _, _ ->
      let msg1 = Ast.to_string ~sep:", " t1 in
      let msg2 = Ast.to_string ~sep:", " t2 in
      let msg = Stdlib.Format.asprintf "Can't divide '%s' '%s'" msg1 msg2 in
      failwith msg

let check_enumerate ~pos u1 u2 : Ast.wip_mark Output.t =
  let {Ast.typ= t1; pos= pos1} = UnionFind.get u1 in
  let {Ast.typ= t2; pos= pos2} = UnionFind.get u2 in
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

let rec check_expression ~replaces ~current ~(ast : Ast.wip_tree) ~contexts
    ~(punion : Ast.wip_mark) (expr : Ast.wip_expr) : unit Output.t =
  let check_expression = check_expression ~replaces ~current ~ast ~contexts in
  let expr, union = expr in
  let {Ast.pos; _} = UnionFind.get union in
  let* _ =
    match expr with
    | Const _ ->
        let* _ = check_union union punion in
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
                  match !status with
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
          let _, union = value in
          let replacements =
            Replacement_graph.find_replacements ~from:current ~rule:ref replaces
            |> List.map ~f:fst
          in
          let* union =
            Output.fold replacements ~init:union ~f:(fun punion ref ->
                let rule_def, status = Hashtbl.find_exn ast ref in
                let* _ =
                  match !status with
                  | Todo ->
                      check_rule_def ~replaces ~ast ~contexts rule_def
                  | Error ->
                      empty
                  | _ ->
                      return ()
                in
                let {Shared_ast.value; _} = rule_def in
                let _, union = value in
                check_enumerate ~pos punion union )
          in
          let* _ = check_union union punion in
          return ()
        in
        let* _ = check_union union punion in
        return ()
    | Binary_op (op, ((_, left_union) as left), ((_, right_union) as right))
      -> (
        let {Ast.pos= left_pos; _} = UnionFind.get left_union in
        let {Ast.pos= right_pos; _} = UnionFind.get right_union in
        match fst op with
        | And | Or ->
            let* _ = Ast.mk_bool ~pos |> check_union union in
            let* _ = check_expression ~punion:union left in
            let* _ = check_expression ~punion:union right in
            let* _ = check_union union punion in
            return ()
        | Add | Sub | Max | Min ->
            (* check both are any number, and unify units *)
            let* left =
              let wip = Ast.mk_any_number ~pos:left_pos in
              let* _ = check_expression ~punion:wip left in
              return wip
            in
            let* right =
              let wip = Ast.mk_any_number ~pos:right_pos in
              let* _ = check_expression ~punion:wip right in
              return wip
            in
            let* _ = check_generalize left right in
            let wip = Ast.mk_number_no_unit ~pos in
            let* _ = check_union left wip in
            let* _ = check_union wip union in
            let* _ = check_union union punion in
            return ()
        | Mul ->
            (* check both are any number *)
            let* _ =
              let wip = Ast.mk_any_number ~pos:left_pos in
              check_expression ~punion:wip left
            in
            let* _ =
              let wip = Ast.mk_any_number ~pos:right_pos in
              check_expression ~punion:wip right
            in
            (* we are TNumber *)
            let* wip = check_multiply ~pos (Mark.get left) (Mark.get right) in
            (* apply to union *)
            let* _ = check_union union wip in
            (* check against punion *)
            let* _ = check_union union punion in
            return ()
        | Div ->
            (* check both are any number *)
            let* _ =
              let wip = Ast.mk_any_number ~pos:left_pos in
              check_expression ~punion:wip left
            in
            let* _ =
              let wip = Ast.mk_any_number ~pos:right_pos in
              check_expression ~punion:wip right
            in
            (* we are TNumber *)
            let* wip = check_divide ~pos (Mark.get left) (Mark.get right) in
            (* apply to mark *)
            let* _ = check_union union wip in
            (* check against punion *)
            let* _ = check_union union punion in
            return ()
        | Pow ->
            let wip = Ast.mk_any_number ~pos:left_pos in
            let* _ = check_expression ~punion:wip left in
            let* _ =
              let wip = Ast.mk_any_number ~pos:right_pos in
              check_expression ~punion:wip right
            in
            let* _ = check_union union wip in
            let* _ = check_union union punion in
            failwith "TODO"
        | Gt | Lt | GtEq | LtEq ->
            let* left =
              let wip = Ast.mk_any_number ~pos:left_pos in
              let* _ = check_expression ~punion:wip left in
              return wip
            in
            let* right =
              let wip = Ast.mk_any_number ~pos:right_pos in
              let* _ = check_expression ~punion:wip right in
              return wip
            in
            (* gather units *)
            let* _ = check_generalize left right in
            (* build current *)
            let* _ = Ast.mk_bool ~pos |> check_union union in
            let* _ = check_union union punion in
            return ()
        | Eq | NotEq ->
            let* left =
              let wip = Ast.mk_any ~pos:left_pos in
              let* _ = check_expression ~punion:wip left in
              return wip
            in
            let* right =
              let wip = Ast.mk_any ~pos:right_pos in
              let* _ = check_expression ~punion:wip right in
              return wip
            in
            let* _ = check_generalize left right in
            let wip = Ast.mk_bool ~pos in
            let* _ = check_union wip punion in
            return () )
    | Unary_op ((Neg, _), expr) ->
        (* check is a number *)
        let wip1 = Ast.mk_any_number ~pos in
        let* _ = check_expression ~punion:wip1 expr in
        (* we are TNumber *)
        let wip2 = Ast.mk_number_no_unit ~pos in
        (* gather unit *)
        let* _ = check_union wip1 wip2 in
        (* merge *)
        let* _ = check_union union wip2 in
        (* check against punion *)
        let* _ = check_union union punion in
        return ()
  in
  return ()

and check_value_mechanism ~replaces ~current ~(ast : Ast.wip_tree) ~contexts
    (value : Ast.wip_marked_value_mechanism) : unit Output.t =
  let check_value = check_value ~replaces ~current ~ast ~contexts in
  let value, union = value in
  let {Ast.pos; _} = UnionFind.get union in
  let* _ =
    match value with
    | Expr expr ->
        let* _ =
          check_expression ~replaces ~current ~ast ~contexts ~punion:union expr
        in
        return ()
    | Value value ->
        let* _ = check_value ~punion:union value in
        return ()
    | Is_applicable _ | Is_not_applicable _ ->
        (* TODO: handle this when Not_applicable is a type *)
        return ()
    | Sum values | Min_of values | Max_of values ->
        (* check all number *)
        let* _ =
          List.map values ~f:(fun value ->
              let wip = Ast.mk_any_number ~pos in
              check_value ~punion:wip value )
          |> all_okay
        in
        (* we are TNumber *)
        let wip = Ast.mk_number_no_unit ~pos in
        (* gather unit *)
        let* _ =
          List.map values ~f:(fun (_, value) -> check_union wip value)
          |> all_okay
        in
        let* _ = check_union wip union in
        return ()
    | Product values ->
        let* _ =
          List.map values ~f:(fun value ->
              let wip = Ast.mk_any_number ~pos in
              check_value ~punion:wip value )
          |> all_okay
        in
        let* wip =
          match values with
          | [] | [_] ->
              failwith "reachable?"
          | hd :: rest ->
              let* init =
                let wip = Ast.mk_any_number ~pos in
                let* _ = check_value ~punion:wip hd in
                return wip
              in
              Output.fold ~init rest ~f:(fun wip value ->
                  check_multiply ~pos wip (Mark.get value) )
        in
        let* _ = check_union wip union in
        return ()
    | All_of values | One_of values ->
        let* _ =
          List.map values ~f:(fun value ->
              let wip = Ast.mk_any_bool ~pos in
              check_value ~punion:wip value )
          |> all_okay
        in
        let wip = Ast.mk_bool ~pos in
        let* _ = check_union wip union in
        return ()
    | Not_defined ->
        return ()
    | Variations (variations, value) ->
        let wip = Ast.mk_any ~pos in
        let* wip =
          Output.fold ~init:wip variations ~f:(fun wip {if_; then_} ->
              let* _ =
                let wip2 = Ast.mk_any_bool ~pos in
                check_value ~punion:wip2 if_
              in
              let wip2 = Ast.mk_any ~pos in
              let* _ = check_value ~punion:wip2 then_ in
              check_enumerate ~pos wip wip2 )
        in
        let* wip =
          match value with
          | None ->
              return wip
          | Some else_ ->
              let wip2 = Ast.mk_any ~pos in
              let* _ = check_value ~punion:wip2 else_ in
              check_enumerate ~pos wip wip2
        in
        let* _ = check_union wip union in
        return ()
  in
  return ()

and check_chainable_mechanism ~replaces ~current ~(ast : Ast.wip_tree) ~contexts
    ~(punion : Ast.wip_mark) (chainable : Ast.wip_marked_chainable_mechanism) :
    unit Output.t =
  let check_value = check_value ~replaces ~current ~ast ~contexts in
  let chainable, union = chainable in
  let {Ast.pos; _} = UnionFind.get union in
  let* _ =
    match chainable with
    | Context _ ->
        (* already done in check_contexts *)
        let* _ = check_union union punion in
        return ()
    | Applicable_if value | Not_applicable_if value ->
        let* _ =
          let union = Ast.mk_any_bool ~pos in
          check_value ~punion:union value
        in
        let* _ = check_union union punion in
        return ()
    | Type (typ, {Mark.pos}) ->
        let wip = Ast.mk_typ ~pos typ in
        let* _ = check_generalize wip punion in
        let* _ = check_union wip union in
        return ()
    | Default value ->
        let wip = Ast.mk_any ~pos in
        let* _ = check_value ~punion:wip value in
        let* wip = check_enumerate ~pos wip punion in
        let* _ = check_union wip union in
        let* _ = check_union union punion in
        return ()
    | Ceiling value | Floor value ->
        let* wip =
          let wip = Ast.mk_any_number ~pos in
          let* _ = check_value ~punion:wip value in
          return wip
        in
        let* _ = check_union wip union in
        let* _ = check_union union punion in
        return ()
    | Round (_, value) ->
        let* _ = check_value value in
        let _, value_union = value in
        let {Ast.typ; pos} = UnionFind.get value_union in
        let wip = Ast.mk_number_no_unit ~pos in
        let* _ =
          match typ with
          | Any_bool _
          | Ast.Literal (LBool _, _)
          | TEnum ((LBool _, _) :: _)
          | TBool ->
              return ()
          | Ast.Any_number _
          | Ast.Literal (LNumber _, _)
          | TEnum ((LNumber _, _) :: _)
          | TNumber _ ->
              let* _ = check_union value_union wip in
              return ()
          | _ ->
              let hints = ["arrondi doit être un nombre ou un booléen"] in
              error_typ_invalid ~hints value_union
        in
        let* _ = check_union wip union in
        let* _ = check_union union punion in
        return ()
  in
  return ()

(* Also fill contexts *)
and check_contexts ~replaces ~current ~(self : Ast.wip_mark)
    ~(contexts : Ast.wip_value Rule_name.Hashtbl.t) ~(ast : Ast.wip_tree)
    (chainables : Ast.wip_marked_chainable_mechanism list) : unit Output.t =
  let* _ =
    List.map chainables ~f:(fun (chainable, _) ->
        match chainable with
        | Context values ->
            let* _ =
              List.map values ~f:(fun ((ref, {Mark.pos}), value) ->
                  let* _, cont_union =
                    let rule_def, status = Hashtbl.find_exn ast ref in
                    let* _ =
                      if Ast.is_todo !status then
                        check_rule_def ~replaces ~ast ~contexts rule_def
                      else return ()
                    in
                    let {Shared_ast.value; _} = rule_def in
                    return value
                  in
                  let* val_union =
                    let wip = Ast.mk_any ~pos in
                    let* _ =
                      check_value ~replaces ~current ~ast ~contexts ~punion:wip
                        value
                    in
                    return wip
                  in
                  let* _ = check_generalize cont_union val_union in
                  let* _ = check_union self cont_union in
                  Hashtbl.set contexts ~key:ref ~data:value ;
                  return () )
              |> all_okay
            in
            return ()
        | _ ->
            return () )
    |> all_okay
  in
  return ()

and check_value ~replaces ~current ~(ast : Ast.wip_tree) ~contexts ?punion
    (value : Ast.wip_value) : unit Output.t =
  let {Shared_ast.value; chainable_mechanisms}, root = value in
  let* _ =
    check_contexts ~replaces ~current ~self:root ~contexts ~ast
      chainable_mechanisms
  in
  let* _ = check_value_mechanism ~replaces ~current ~ast ~contexts value in
  let _, union = value in
  let* union =
    List.sort chainable_mechanisms ~compare:(fun (a, _) (b, _) ->
        Shared_ast.compare_chainable_mechanism Shared.Rule_name.compare
          Ast.compare_wip_mark a b )
    |> Output.fold ~init:union ~f:(fun punion chainable ->
        let* _ =
          check_chainable_mechanism ~replaces ~current ~ast ~contexts ~punion
            chainable
        in
        let _, union = chainable in
        return union )
  in
  let* _ = check_union union root in
  let* _ =
    match punion with
    | None ->
        return ()
    | Some punion ->
        let* _ = check_union union punion in
        return ()
  in
  return ()

and check_rule_def ~replaces ~(ast : Ast.wip_tree) ?contexts
    (rule_def : Ast.wip_rule_def) : unit Output.t =
  let _, status = Hashtbl.find_exn ast (Mark.remove rule_def.name) in
  if not (Ast.is_todo !status) then failwith "already done" ;
  status := Ast.Doing ;
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
    let _, pmark = value in
    (* TODO: better pos to notice this? *)
    match List.hd rule_def.make_not_applicable with
    | None ->
        return ()
    | Some hd ->
        let typ = Ast.mk_any_bool ~pos:(Mark.pos hd.reference) in
        check_union typ pmark
  in
  match res with
  | None, logs ->
      status := Ast.Error ;
      break ~logs ()
  | Some _, logs ->
      status := Ast.Done ;
      break ~logs ()

let type_check ~replaces (ast : Ast.wip_tree) : unit Output.t =
  let* _ =
    Hashtbl.to_alist ast |> List.map ~f:snd
    |> List.sort
         ~compare:(fun
             ({Shared_ast.name= _, {Mark.pos= p1}; _}, _)
             ({Shared_ast.name= _, {Mark.pos= p2}; _}, _)
           -> Pos.compare p1 p2 )
    |> List.map ~f:(fun (rule_def, status) ->
        if Ast.is_todo !status then check_rule_def ~replaces ~ast rule_def
        else return () )
    |> all_okay
  in
  return ()
