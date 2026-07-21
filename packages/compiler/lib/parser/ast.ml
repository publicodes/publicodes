open Shared
open Base
open Utils
include Shared_ast

type t = (string list, Mark.pos_mark) Shared_ast.t [@@deriving equal, show]

type value = (string list, Mark.pos_mark) Shared_ast.value
[@@deriving equal, show]
