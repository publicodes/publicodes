open Base

type date =
  | Day of {day: int; year: int; month: int}
  | Month of {month: int; year: int}
[@@deriving equal, compare, show, sexp]

type literal =
  | LNumber of float * Units.t option
  | LBool of bool
  | LString of string
  | LSymbol of string
  | LDate of date
[@@deriving equal, compare, show, sexp]

type t =
  | Literal of literal Utils.Mark.pos
  | TString
  | TBool
  | TDate
  | TNumber of Units.t option
  | (* NOTE: should be a Set instead? How to handle positions of multiple
      definitions of the same literal? *)
    TEnum of literal Utils.Mark.pos list
[@@deriving equal, compare, show, sexp]

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
  | LNumber (n, Some u) ->
      Stdlib.Format.asprintf "%f%a" n Units.pp u
  | LNumber (n, None) ->
      Stdlib.Format.asprintf "%f" n

let to_string ~sep : t -> string = function
  | Literal (lit, _) ->
      literal_to_string lit
  | TString ->
      "text"
  | TBool ->
      "boolean"
  | TDate ->
      "date"
  | TNumber _ ->
      "number"
  | TEnum values ->
      List.map values ~f:Utils.Mark.remove
      |> List.map ~f:literal_to_string
      |> String.concat ~sep
