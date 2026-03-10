open Jingoo.Jg_types

type t

val from_rules_outputs : tvalue -> tvalue -> t

val from_template : string -> t -> string
