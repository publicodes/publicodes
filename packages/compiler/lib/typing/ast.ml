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

type t =
  | Any of Any.t
  | Any_number of Number_unit.t
  | Any_bool of Any.t
  | Any_string of Any.t
  | Any_date of Any.t
  | Literal of literal Utils.Mark.pos
  | TString
  | TBool
  | TDate
  | TNumber of Number_unit.t
  | TEnum of literal Mark.pos list

let literal_to_string : literal -> string = function
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
      Stdlib.Format.asprintf "%s" (Float.to_string n)

let sort_enum enum =
  List.sort enum ~compare:(fun (_, {Mark.pos= p1}) (_, {Mark.pos= p2}) ->
      Pos.compare p1 p2 )

let to_string ~sep : t -> string = function
  | Any _ ->
      "n'importe quelle valeur"
  | Any_number _ ->
      "n'importe quel nombre"
  | Any_bool _ ->
      "n'importe quel booléan"
  | Any_string _ ->
      "n'importe quel texte"
  | Any_date _ ->
      "n'importe quelle date"
  | Literal (LBool true, _) ->
      "le booléan oui"
  | Literal (LBool false, _) ->
      "le booléan non"
  | Literal (LDate (Day {year; month; day}), _) ->
      Printf.sprintf "la date %d-%02d-%02d" year month day
  | Literal (LDate (Month {year; month}), _) ->
      Printf.sprintf "la date %d-%02d" year month
  | Literal (LString s, _) ->
      "le texte \"" ^ s ^ "\""
  | Literal (LSymbol s, _) ->
      "le symbole '" ^ s ^ "'"
  | Literal (LNumber (n, _), _) ->
      Stdlib.Format.asprintf "le nombre %s" (Float.to_string n)
  | TString ->
      "un texte"
  | TBool ->
      "un booléan"
  | TDate ->
      "une date"
  | TNumber _ ->
      Stdlib.Format.asprintf "un nombre"
  | TEnum values ->
      sort_enum values |> List.map ~f:fst
      |> List.map ~f:literal_to_string
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

(* Constructors *)

let from_mark {Mark.pos} typ = {typ; pos}

let mk ~pos typ : typ = UnionFind.make (Mark.mk_pos ~pos typ)

let mk_any ~pos = mk ~pos (Any (Any.mk ()))

let mk_any_number ~pos = mk ~pos (Any_number (Number_unit.any ()))

let mk_any_bool ~pos = mk ~pos (Any_bool (Any.mk ()))

let mk_any_string ~pos = mk ~pos (Any_string (Any.mk ()))

let mk_any_date ~pos = mk ~pos (Any_date (Any.mk ()))

let mk_literal ~pos literal = mk ~pos (Literal (Mark.mk_pos ~pos literal))

let mk_lit_number ~pos number unit =
  match unit with
  | Some unit ->
      mk_literal ~pos (LNumber (number, Number_unit.concrete unit))
  | None ->
      mk_literal ~pos (LNumber (number, Number_unit.any ()))

let mk_lit_bool ~pos bool = mk_literal ~pos (LBool bool)

let mk_lit_string ~pos string = mk_literal ~pos (LString string)

let mk_lit_symbol ~pos symbol = mk_literal ~pos (LSymbol symbol)

let mk_lit_day ~pos day year month =
  mk_literal ~pos (LDate (Typ.Day {day; year; month}))

let mk_lit_month ~pos year month =
  mk_literal ~pos (LDate (Typ.Month {year; month}))

let mk_string ~pos = mk ~pos TString

let mk_bool ~pos = mk ~pos TBool

let mk_date ~pos = mk ~pos TDate

let mk_number_no_unit ~pos = mk ~pos (TNumber (Number_unit.any ()))

let mk_number ~pos unit = mk ~pos (TNumber (Number_unit.concrete unit))

let mk_enum ~pos values = mk ~pos (TEnum values)

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
  | TNumber (Some u) ->
      mk_number ~pos u
  | TNumber None ->
      mk_number_no_unit ~pos
  | TEnum values ->
      let values =
        List.map values ~f:(function
          | Typ.LNumber (f, Some u), pos ->
              (LNumber (f, Number_unit.concrete u), pos)
          | Typ.LNumber (f, None), pos ->
              (LNumber (f, Number_unit.any ()), pos)
          | Typ.LBool b, pos ->
              (LBool b, pos)
          | Typ.LString s, pos ->
              (LString s, pos)
          | Typ.LSymbol s, pos ->
              (LSymbol s, pos)
          | Typ.LDate d, pos ->
              (LDate d, pos) )
      in
      mk_enum ~pos values

(* Methods *)

let compare_typing_mark _ _ = 0

let equal_literal l1 l2 =
  match l1 with
  | LNumber (v1, _) -> (
    match l2 with LNumber (v2, _) -> Float.equal v1 v2 | _ -> false )
  | LBool v1 -> (
    match l2 with LBool v2 -> Bool.equal v1 v2 | _ -> false )
  | LString v1 -> (
    match l2 with LString v2 -> String.equal v1 v2 | _ -> false )
  | LSymbol v1 -> (
    match l2 with LSymbol v2 -> String.equal v1 v2 | _ -> false )
  | LDate v1 -> (
    match l2 with LDate v2 -> Typ.equal_date v1 v2 | _ -> false )

let is_todo = function Todo -> true | _ -> false

let set_typing_state typing_tree (rule_def : typing_rule_def)
    (status : typing_state) =
  let rule_name = Mark.remove rule_def.name in
  Hashtbl.set typing_tree ~key:rule_name ~data:(rule_def, status)

let equal_type t1 t2 =
  match (t1, t2) with
  | Any _, Any _
  | Any_number _, Any_number _
  | Any_bool _, Any_bool _
  | Any_string _, Any_string _
  | Any_date _, Any_date _
  | TString, TString
  | TBool, TBool
  | TDate, TDate ->
      true
  | Literal (l1, _), Literal (l2, _) ->
      equal_literal l1 l2
  | TNumber u1, TNumber u2 ->
      Number_unit.equal u1 u2
  | TEnum v1, TEnum v2 ->
      List.length v1 = List.length v2
      && List.for_all2_exn v1 v2 ~f:(fun (l1, _) (l2, _) ->
          equal_literal l1 l2 )
  | _ ->
      false

let is_any_equal t1 t2 =
  match (t1, t2) with
  | Any _, Any _
  | Any_number _, Any_number _
  | Any_bool _, Any_bool _
  | Any_string _, Any_string _
  | Any_date _, Any_date _ ->
      true
  | _ ->
      false

let is_any = function
  | Any _ | Any_number _ | Any_bool _ | Any_string _ | Any_date _ ->
      true
  | _ ->
      false

let is_specialized_string = function
  | Literal (LString _, _) | TEnum ((LString _, _) :: _) | TString ->
      true
  | _ ->
      false

let is_string ty =
  match ty with Any_string _ -> true | _ -> is_specialized_string ty

let is_specialized_bool = function
  | Literal (LBool _, _) | TEnum ((LBool _, _) :: _) | TBool ->
      true
  | _ ->
      false

let is_bool ty =
  match ty with Any_bool _ -> true | _ -> is_specialized_bool ty

let is_specialized_date = function
  | Literal (LDate _, _) | TEnum ((LDate _, _) :: _) | TDate ->
      true
  | _ ->
      false

let is_date ty =
  match ty with Any_date _ -> true | _ -> is_specialized_date ty
