open Core
open Utils
(* A simpler YAML tree with position information *)

type scalar_style =
  [ `Any | `Plain | `Single_quoted | `Double_quoted | `Literal | `Folded ]
[@@deriving show, sexp, compare]

type naked_scalar = { value : string; style : scalar_style }
[@@deriving show, sexp, compare]

type yaml = [ `Scalar of scalar | `A of sequence | `O of mapping ]
[@@deriving show, sexp, compare]

and scalar = naked_scalar With_pos.t [@@deriving show, sexp, compare]
and sequence = yaml list [@@deriving show, sexp, compare]
and mapping = (scalar * yaml) list [@@deriving show, sexp, compare]

let get_value : scalar -> string = fun ({ value; _ }, _) -> value
