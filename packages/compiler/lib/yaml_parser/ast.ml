open Base
open Utils
(* A simpler YAML tree with position inStdlib.Formation *)

type scalar_style =
  [`Any | `Plain | `Single_quoted | `Double_quoted | `Literal | `Folded]
[@@deriving equal, compare, sexp]

type naked_scalar = {value: string; style: scalar_style}
[@@deriving equal, compare, sexp]

type yaml = [`Scalar of scalar | `A of sequence | `O of mapping]
[@@deriving equal, compare, sexp]

and scalar = naked_scalar Pos.t [@@deriving equal, compare, sexp]

and sequence = yaml list [@@deriving equal, compare, sexp]

and mapping = (scalar * yaml) list [@@deriving equal, compare, sexp]

let get_value : scalar -> string = fun ({value; _}, _) -> value
