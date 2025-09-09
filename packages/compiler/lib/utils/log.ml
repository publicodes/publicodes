
type kind = [`Yaml | `Lex | `Syntax | `Type | `Cycle | `Global | `Replace] [@@deriving eq, show]

type level = [`Error | `Warning | `Debug] [@@deriving eq, show]

type log =
  { kind: kind
  ; level: level
  ; message: string
  ; hints: string list
  ; labels: string Pos.t list
  ; code: Err.Code.t option }
[@@deriving eq, show ]

type t = log Pos.t [@@deriving eq]

let mk ~level ?(kind = `Global) ?(pos = Pos.dummy) ?(hints = []) ?(labels = [])
    ?(code = None) message =
  Pos.mk ~pos {kind; level; message; hints; labels; code}

let error ~code = mk ~level:`Error ~code:(Some code)

let warning ~code = mk ~level:`Warning ~code:(Some code)

let debug ~code = mk ~level:`Debug ~code:(Some code)

let message log = (Pos.value log).message

let level log = (Pos.value log).level
