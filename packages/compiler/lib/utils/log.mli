type t [@@deriving show, sexp, compare]

type kind = [`Yaml | `Lex | `Syntax | `Type | `Cycle | `Global]
[@@deriving show, sexp, compare]

type level = [`Error | `Warning | `Info] [@@deriving show, sexp, compare]

type log = {kind: kind; level: level; message: string; hint: string option}
[@@deriving show, sexp, compare]

val error : pos:Pos.pos -> kind:kind -> ?hint:string -> string -> t

val warning : pos:Pos.pos -> kind:kind -> ?hint:string -> string -> t

val info : ?pos:Pos.pos -> ?kind:kind -> ?hint:string -> string -> t

val message : t -> string

val print_ansi : t -> unit
