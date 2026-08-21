open Base
open Shared
open Utils
module Any = Utils.Uid.Make ()

type literal =
  | LNumber of float * Number_unit.t
  | LBool of bool
  | LString of string
  | LSymbol of string
  | LDate of Typ.date

type kind = KNumber of Number_unit.t | KString | KBool | KDate | KSymbol

type precision =
  | Any_kind of Any.t (* Any_number, Any_string, Any_bool, Any_date *)
  | General (* TNumber, TString, TBool, TDate *)
  | Literal of literal Utils.Mark.pos
  | Enum of literal Mark.pos list

type t = Any of Any.t | Typed of kind * precision

let equal_literal l1 l2 =
  match (l1, l2) with
  | LNumber (v1, u1), LNumber (v2, u2) ->
      Float.equal v1 v2 && Number_unit.equal u1 u2
  | LBool v1, LBool v2 ->
      Bool.equal v1 v2
  | LString v1, LString v2 | LSymbol v1, LSymbol v2 ->
      String.equal v1 v2
  | LDate v1, LDate v2 ->
      Typ.equal_date v1 v2
  | _ ->
      false

let compare_literal l1 l2 =
  match (l1, l2) with
  | LNumber (v1, u1), LNumber (v2, u2) ->
      if Number_unit.equal u1 u2 then Float.compare v1 v2
      else Number_unit.compare u1 u2
  | LBool v1, LBool v2 ->
      Bool.compare v1 v2
  | LString v1, LString v2 | LSymbol v1, LSymbol v2 ->
      String.compare v1 v2
  | LDate d1, LDate d2 ->
      Typ.compare_date d1 d2
  | _ ->
      Stdlib.compare l1 l2

let sort_enum enum =
  List.sort enum ~compare:(fun (_, {Mark.pos= p1}) (_, {Mark.pos= p2}) ->
      Pos.compare p1 p2 )

let get_missing_literals enum1 enum2 =
  List.filter enum1 ~f:(fun (lit1, _) ->
      not (List.exists enum2 ~f:(fun (lit2, _) -> equal_literal lit1 lit2)) )

let is_enum_subset enum1 enum2 =
  List.for_all enum1 ~f:(fun (lit1, _) ->
      List.exists enum2 ~f:(fun (lit2, _) -> equal_literal lit1 lit2) )

let literal_to_string : literal -> string = function
  | LBool true ->
      "le booléan oui"
  | LBool false ->
      "le booléan non"
  | LDate (Day {year; month; day}) ->
      Printf.sprintf "la date %d-%02d-%02d" year month day
  | LDate (Month {year; month}) ->
      Printf.sprintf "la date %d-%02d" year month
  | LString s ->
      "le texte \"" ^ s ^ "\""
  | LSymbol s ->
      "le symbole '" ^ s ^ "'"
  | LNumber (n, _) ->
      (* TODO: why not print the unit? *)
      Stdlib.Format.asprintf "le nombre %s" (Float.to_string n)

let literal_to_string_short : literal -> string = function
  | LBool true ->
      "oui"
  | LBool false ->
      "non"
  | LDate (Day {year; month; day}) ->
      Printf.sprintf "%d-%02d-%02d" year month day
  | LDate (Month {year; month}) ->
      Printf.sprintf "%d-%02d" year month
  | LString s ->
      "\"" ^ s ^ "\""
  | LSymbol s ->
      "'" ^ s ^ "'"
  | LNumber (n, _) ->
      (* TODO: why not print the unit? *)
      Stdlib.Format.asprintf "%s" (Float.to_string n)

let to_string ?(sep = ", ") : t -> string = function
  | Any _ ->
      "n'importe quelle valeur"
  | Typed (KNumber _, Any_kind _) ->
      "n'importe quel nombre"
  | Typed (KBool, Any_kind _) ->
      "n'importe quel booléan"
  | Typed (KString, Any_kind _) ->
      "n'importe quel texte"
  | Typed (KDate, Any_kind _) ->
      "n'importe quelle date"
  | Typed (KSymbol, Any_kind _) ->
      (* NOTE: should not happen, but we keep it for completeness *)
      "n'importe quel symbole"
  | Typed (_, Literal (lit, _)) ->
      literal_to_string lit
  | Typed (KString, General) ->
      "un texte"
  | Typed (KBool, General) ->
      "un booléan"
  | Typed (KDate, General) ->
      "une date"
  | Typed (KNumber _, General) ->
      Stdlib.Format.asprintf "un nombre"
  | Typed (KSymbol, General) ->
      Stdlib.Format.asprintf "un symbole"
  | Typed (_, Enum values) ->
      sort_enum values |> List.map ~f:fst
      |> List.map ~f:literal_to_string_short
      |> String.concat ~sep
      |> Stdlib.Format.asprintf "l'énum [%s]"


(* Definitions *)

type typ = t Mark.pos UnionFind.elem

type typing_mark = {pos: Pos.t; typ: typ}

type typing_value = (Rule_name.t, typing_mark) Shared_ast.value

type typing_rule_def = (Rule_name.t, typing_mark) Shared_ast.rule_def

type typing_value_mechanism =
  (Rule_name.t, typing_mark) Shared_ast.value_mechanism

type typing_marked_value_mechanism =
  (typing_value_mechanism, typing_mark) Mark.ed

type typing_expr = (Rule_name.t, typing_mark) Shared_ast.expr

type typing = (Rule_name.t, typing_mark) Shared_ast.t

type typing_chainable_mechanism =
  (Rule_name.t, typing_mark) Shared_ast.chainable_mechanism

type typing_marked_chainable_mechanism =
  (typing_chainable_mechanism, typing_mark) Mark.ed

type typing_state = Todo | Doing | Done | Error

type typing_tree = (typing_rule_def * typing_state) Rule_name.Hashtbl.t

let typ_to_string ?sep (typ : typ) =
  let typ, _ = UnionFind.get typ in
  to_string ?sep typ

let get_rule_defs (typing_tree : typing_tree) : typing_rule_def list =
  Hashtbl.to_alist typing_tree
  |> List.map ~f:(fun (_, (rule_def, _)) -> rule_def)

let get_sorted_rule_defs (typing_tree : typing_tree) : typing_rule_def list =
  get_rule_defs typing_tree
  |> List.sort
       ~compare:(fun
           Shared_ast.{name= _, {pos= p1}; _}
           Shared_ast.{name= _, {pos= p2}; _}
         -> Pos.compare p1 p2 )

let get_sorted_chainable_mechanisms chainable_mechanisms =
  (** FIXME: is this correct? *)
  let compare_typing_mark _ _ = 0 in
  List.sort chainable_mechanisms ~compare:(fun (a, _) (b, _) ->
      Shared_ast.compare_chainable_mechanism Shared.Rule_name.compare
        compare_typing_mark a b )

let get_first_element_pos_exn values =
  match values with
  | [] ->
      raise (Invalid_argument "get_first_element_pos_exn: empty list")
  | hd :: _ ->
      let mark = Mark.get hd in
      mark.pos

(* Constructors *)

let from_mark ({pos} : Mark.pos_mark) typ = {typ; pos}

let mk ~pos typ : typ = UnionFind.make (Mark.mk_pos ~pos typ)

let mk_any ~pos = mk ~pos (Any (Any.mk ()))

let mk_typed ~pos kind precision = mk ~pos (Typed (kind, precision))

let mk_any_kind ~pos kind = mk_typed ~pos kind (Any_kind (Any.mk ()))

let mk_any_number ~pos = mk_any_kind ~pos (KNumber (Number_unit.any ()))

let mk_any_bool ~pos = mk_any_kind ~pos KBool

let mk_any_string ~pos = mk_any_kind ~pos KString

let mk_any_date ~pos = mk_any_kind ~pos KDate

let kind_of_literal = function
  | LNumber (_, u) ->
      KNumber u
  | LBool _ ->
      KBool
  | LString _ ->
      KString
  | LSymbol _ ->
      KSymbol
  | LDate _ ->
      KDate

let mk_literal ~pos literal =
  let kind = kind_of_literal literal in
  mk_typed ~pos kind (Literal (Mark.mk_pos ~pos literal))

let mk_lit_number ~pos number unit =
  let unit =
    match unit with
    | Some u ->
        Number_unit.concrete u
    | None ->
        Number_unit.any ()
  in
  mk_literal ~pos (LNumber (number, unit))

let mk_lit_bool bool = mk_literal (LBool bool)

let mk_lit_string string = mk_literal (LString string)

let mk_lit_symbol symbol = mk_literal (LSymbol symbol)

let mk_lit_day day year month = mk_literal (LDate (Typ.Day {day; year; month}))

let mk_lit_month year month = mk_literal (LDate (Typ.Month {year; month}))

let mk_general ~pos kind = mk_typed ~pos kind General

let mk_string = mk_general KString

let mk_bool = mk_general KBool

let mk_date = mk_general KDate

let mk_number ~(unit: Units.t option) ~pos =
  let unit = match unit with
    | Some u ->
        Number_unit.concrete u
    | None ->
        Number_unit.any ()
  in
  mk_typed ~pos (KNumber (unit)) General

let mk_number_without_unit ~pos = mk_typed ~pos (KNumber ([])) General

let mk_enum_precision values =
  let values =
    (* Normalize values by removing duplicates. *)
    values
    |> List.stable_dedup ~compare:(fun (lit1, _) (lit2, _) -> compare_literal
    lit1 lit2)
    |> sort_enum
  in
  Enum values

let mk_enum ~pos values =
  match values with
  | [] ->
      mk_any ~pos
  | (lit, _) :: _ ->
      let kind = kind_of_literal lit in
      let precision = mk_enum_precision values in
      mk_typed ~pos kind precision

let mk_typ_lit ~pos (typ : Typ.literal) =
  match typ with
  | LBool b ->
      mk_lit_bool ~pos b
  | LDate (Day {year; month; day}) ->
      mk_lit_day ~pos year month day
  | LDate (Month {year; month}) ->
      mk_lit_month ~pos year month
  | LString s ->
      mk_lit_string ~pos s
  | LSymbol s ->
      mk_lit_symbol ~pos s
  | LNumber (n, u) ->
      mk_lit_number ~pos n u

let literal_of_shared_typ ((lit, pos) : Typ.literal Mark.pos) =
  match lit with
  | Typ.LNumber (n, None) ->
      (LNumber (n, Number_unit.any ()), pos)
  | Typ.LNumber (n, Some u) ->
      (LNumber (n, Number_unit.concrete u), pos)
  | LBool b ->
      (LBool b, pos)
  | LString s ->
      (LString s, pos)
  | LSymbol s ->
      (LSymbol s, pos)
  | LDate d ->
      (LDate d, pos)

let literal_to_shared_typ ((lit, pos) : literal Mark.pos) =
  match lit with
  | LNumber (n, u) ->
      let u = Number_unit.to_concrete u in
      (Typ.LNumber (n, Some u), pos)
  | LBool b ->
      (Typ.LBool b, pos)
  | LString s ->
      (Typ.LString s, pos)
  | LSymbol s ->
      (Typ.LSymbol s, pos)
  | LDate d ->
      (Typ.LDate d, pos)

let mk_typ ~pos (typ : Typ.t) =
  match typ with
  | Literal (lit, _) ->
      mk_typ_lit ~pos lit
  | TString ->
      mk_string ~pos
  | TBool ->
      mk_bool ~pos
  | TDate ->
      mk_date ~pos
  | TNumber unit ->
      mk_number ~pos ~unit
  | TEnum values ->
      let values =
        List.map values ~f:(fun (lit, pos) ->
            match lit with
            | Typ.LNumber (n, Some u) ->
                (LNumber (n, Number_unit.concrete u), pos)
            | Typ.LNumber (n, None) ->
                (LNumber (n, Number_unit.any ()), pos)
            | Typ.LBool b ->
                (LBool b, pos)
            | Typ.LString s ->
                (LString s, pos)
            | Typ.LSymbol s ->
                (LSymbol s, pos)
            | Typ.LDate d ->
                (LDate d, pos) )
      in
      mk_enum ~pos values

(* Methods *)

let is_todo = function Todo -> true | _ -> false

let set_typing_state typing_tree (rule_def : typing_rule_def)
    (status : typing_state) =
  let rule_name = Mark.remove rule_def.name in
  Hashtbl.set typing_tree ~key:rule_name ~data:(rule_def, status)

let is_kind_equal k1 k2 =
  match (k1, k2) with
  | KNumber _, KNumber _ ->
      true
  | KBool, KBool ->
      true
  | KString, KString ->
      true
  | KDate, KDate ->
      true
  | KSymbol, KSymbol ->
      true
  | _ ->
      false

let is_bool = function Typed (KBool, _) -> true | _ -> false

let is_typ_number_with_unit typ =
  let t, _ = UnionFind.get typ in
  match t with
  | Typed  (KNumber u, _) when not (Number_unit.is_any u) ->
      true
  | _ ->
      false

let literal_to_general typ =
  let t, _ = UnionFind.get typ in
  match t with
  | Typed (k, Literal _) ->
      Typed (k, General)
  | _ ->
      t

let number_without_unit =  Typed (KNumber [], General)

