type t [@@deriving show, sexp, compare]

type kind = [`Yaml | `Lex | `Syntax | `Type | `Cycle | `Global]
[@@deriving show, sexp, compare]

type level = [`Error | `Warning | `Info] [@@deriving show, sexp, compare]

val error :
     code:Err.Code.t
  -> ?kind:kind
  -> ?pos:Pos.pos
  -> ?hints:string list
  -> ?labels:string Pos.t list
  -> string
  -> t

val warning :
     code:Err.Code.t
  -> ?kind:kind
  -> ?pos:Pos.pos
  -> ?hints:string list
  -> ?labels:string Pos.t list
  -> string
  -> t

val info :
     ?kind:kind
  -> ?pos:Pos.pos
  -> ?hints:string list
  -> ?labels:string Pos.t list
  -> string
  -> t

val message : t -> string

val level : t -> level

val print_ansi : t -> unit
