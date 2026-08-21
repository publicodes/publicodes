open Base
open Utils

type date =
  | Day of {day: int; year: int; month: int}
  | Month of {month: int; year: int}
[@@deriving equal, compare, show, sexp]

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
  | Symbol of string
  | Date of date
[@@deriving equal, compare, show, sexp]

type binary_op =
  | Add
  | Sub
  | Mul
  | Div
  | Pow
  | Gt
  | Lt
  | GtEq
  | LtEq
  | Eq
  | NotEq
  | And
  | Or
  | Max
  | Min
[@@deriving equal, compare, show, sexp]

type unary_op = Neg [@@deriving equal, compare, show, sexp]

type rounding = Up | Down | Nearest [@@deriving equal, compare, show, sexp]

type typed_mark = {pos: Pos.t; typ: Typ.t option}
[@@deriving equal, compare, show, sexp]

type ('ref, 'mark) naked_expr =
  | Const of constant
  | Ref of 'ref
  | Binary_op of binary_op Mark.pos * ('ref, 'mark) expr * ('ref, 'mark) expr
  | Unary_op of unary_op Mark.pos * ('ref, 'mark) expr
[@@deriving equal, compare, show, sexp]

and ('ref, 'mark) expr = (('ref, 'mark) naked_expr, 'mark) Mark.ed
[@@deriving equal, compare, show, sexp]

type ('ref, 'mark) value_mechanism =
  | Expr of ('ref, 'mark) expr
  | Value of ('ref, 'mark) value
  | Is_applicable of ('ref, 'mark) value
  | Is_not_applicable of ('ref, 'mark) value
  | Sum of ('ref, 'mark) value list
  | Product of ('ref, 'mark) value list
  | Average of ('ref, 'mark) value list
  | All_of of ('ref, 'mark) value list
  | Min_of of ('ref, 'mark) value list
  | Max_of of ('ref, 'mark) value list
  | One_of of ('ref, 'mark) value list
  | Not_defined
  | Variations of (('ref, 'mark) variation list * ('ref, 'mark) value option)
  | Root_finding of ('ref, 'mark) root_finding
[@@deriving equal, compare, show, sexp]

and ('ref, 'mark) variation =
  {if_: ('ref, 'mark) value; then_: ('ref, 'mark) value}
[@@deriving equal, compare, show, sexp]

and ('ref, 'mark) root_finding =
  {with_: 'ref Mark.pos list; tolerance: float; min: float; max: float}
[@@deriving equal, compare, show, sexp]

(* The order of chainable mechanisms matters here: it is used to determine the
   precedence of the mechanisms (first ones are applied first) *)
and ('ref, 'mark) chainable_mechanism =
  | Context of ('ref Mark.pos * ('ref, 'mark) value) list
  | Applicable_if of ('ref, 'mark) value
  | Not_applicable_if of ('ref, 'mark) value
  | Type of Typ.t Mark.pos
  | Default of ('ref, 'mark) value
  | Ceiling of ('ref, 'mark) value
  | Floor of ('ref, 'mark) value
  | Round of (rounding * ('ref, 'mark) value)
[@@deriving equal, compare, show, sexp]

and ('ref, 'mark) naked_value =
  { value: (('ref, 'mark) value_mechanism, 'mark) Mark.ed
  ; chainable_mechanisms:
      (('ref, 'mark) chainable_mechanism, 'mark) Mark.ed list }
[@@deriving equal, show, sexp]

and ('ref, 'mark) value = (('ref, 'mark) naked_value, 'mark) Mark.ed

type rule_meta =
  | Title of string
  | Description of string
  | Note of string
  | Public
  | Custom_meta of Yojson.Safe.t
  | Module_id of Module_id.t
  | Applicable_on_namespace
[@@deriving equal, show]

type 'ref replace =
  { reference: 'ref Mark.pos
  ; only_in: 'ref Mark.pos list
  ; except_in: 'ref Mark.pos list
  ; exclusive: bool }
[@@deriving equal, show, sexp]

type ('ref, 'mark) rule_def =
  { name: Rule_name.t Mark.pos
  ; value: ('ref, 'mark) value
  ; meta: rule_meta list
  ; replace: 'ref replace list
  ; make_not_applicable: 'ref replace list }
[@@deriving equal, show]

type ('ref, 'mark) t = ('ref, 'mark) rule_def list [@@deriving equal, show]

type resolved_rule_def = (Rule_name.t, Mark.pos_mark) rule_def

type resolved_value_mechanism = (Rule_name.t, Mark.pos_mark) value_mechanism

type resolved_chainable_mechanism =
  (Rule_name.t, Mark.pos_mark) chainable_mechanism

type resolved_value = (Rule_name.t, Mark.pos_mark) value

type resolved_expr = (Rule_name.t, Mark.pos_mark) expr

type resolved = (Rule_name.t, Mark.pos_mark) t [@@deriving equal, show]

type typed_value = (Rule_name.t, typed_mark) value

type typed_rule_def = (Rule_name.t, typed_mark) rule_def

type typed_expr = (Rule_name.t, typed_mark) expr

type typed_value_mechanism = (Rule_name.t, typed_mark) value_mechanism

type typed_chainable_mechanism = (Rule_name.t, typed_mark) chainable_mechanism

type typed = (Rule_name.t, typed_mark) t [@@deriving equal, show]

let binary_op_to_string = function
  | Add ->
      "+"
  | Sub ->
      "-"
  | Mul ->
      "*"
  | Div ->
      "/"
  | Pow ->
      "**"
  | Gt ->
      ">"
  | Lt ->
      "<"
  | GtEq ->
      ">="
  | LtEq ->
      "<="
  | Eq ->
      "="
  | NotEq ->
      "!="
  | And ->
      "&&"
  | Or ->
      "||"
  | Max ->
      "max"
  | Min ->
      "min"

(** Constructors *)

let mk_expr mark expr = Mark.add mark expr

(** Map expression *)
let has_public_tag rule_def =
  List.exists ~f:(function Public -> true | _ -> false) rule_def.meta

let has_applicable_on_namespace_tag rule_def =
  List.exists
    ~f:(function Applicable_on_namespace -> true | _ -> false)
    rule_def.meta

let get_module_id_exn rule_def =
  List.find_map_exn rule_def.meta ~f:(fun meta ->
      match meta with Module_id id -> Some id | _ -> None )

let has_value rule_def =
  let value = Mark.remove rule_def.value in
  match Mark.remove value.value with Not_defined -> false | _ -> true

let merge (p1 : ('ref, 'mark) t) (p2 : ('ref, 'mark) t) = List.append p1 p2

let find_exn rule_name =
  List.find_exn ~f:(fun {name; _} ->
      Rule_name.equal (Mark.remove name) rule_name )

let get_pos_exn (ast : ('ref, 'mark) t) (rule_name : Rule_name.t) : Pos.t =
  let rule_def = find_exn rule_name ast in
  Mark.pos rule_def.name
