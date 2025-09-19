open Shared
open Base

include Shared_ast


type t = string list Shared_ast.t [@@deriving equal, show]

type value = string list Shared_ast.value [@@deriving equal, show]
