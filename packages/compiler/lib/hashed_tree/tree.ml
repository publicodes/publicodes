open Shared
open Core

type hash_and_type = {typ: Typ.t option; hash: To_hash.t}
[@@deriving show, sexp]

type t = hash_and_type Eval_tree.t [@@deriving show, sexp]

type value = hash_and_type Eval_tree.value
