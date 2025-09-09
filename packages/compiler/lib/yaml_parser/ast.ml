open Core
open Utils
(* A simpler YAML tree with position information *)

type scalar_style =
  [`Any | `Plain | `Single_quoted | `Double_quoted | `Literal | `Folded]
[@@deriving eq, ord, sexp]

type naked_scalar = {value: string; style: scalar_style}
[@@deriving eq, ord, sexp]

type yaml = [`Scalar of scalar | `A of sequence | `O of mapping]
[@@deriving eq, ord, sexp]

and scalar = naked_scalar Pos.t [@@deriving eq, ord, sexp]

and sequence = yaml list [@@deriving eq, ord, sexp]

and mapping = (scalar * yaml) list [@@deriving eq, ord, sexp]

let get_value : scalar -> string = fun ({value; _}, _) -> value
