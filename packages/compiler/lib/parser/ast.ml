open Shared
include Shared_ast

type t = string list Shared_ast.t [@@deriving eq, show]

type value = string list Shared_ast.value [@@deriving eq, show]
