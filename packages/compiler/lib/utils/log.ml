open Base

type kind = [`Yaml | `Lex | `Syntax | `Type | `Cycle | `Global | `Replace]
[@@deriving equal, show]

type level = [`Error | `Warning | `Debug | `Bug] [@@deriving equal, show]

type log =
  { kind: kind
  ; level: level
  ; message: string
  ; primary_label: string option
  ; labels: string Mark.pos list
  ; hints: string list
  ; code: Err.Code.t option }
[@@deriving equal, show]

type t = log Mark.pos [@@deriving equal]

let compare one two =
  let one = Mark.pos one in
  let two = Mark.pos two in
  Pos.compare one two

let mk ~level ?(kind = `Global) ?(pos = Pos.dummy) ?(hints = []) ?(labels = [])
    ?(code = None) ?(primary_label = None) message =
  Mark.mk_pos ~pos {kind; level; message; hints; labels; code; primary_label}

let update f (t : t) : t = Mark.map t ~f:(fun log -> f log)

let with_kind kind = update (fun log -> {log with kind})

let with_level level = update (fun log -> {log with level})

let with_message message = update (fun log -> {log with message})

let with_hints hints = update (fun log -> {log with hints})

let add_hint hint = update (fun log -> {log with hints= log.hints @ [hint]})

let with_labels labels = update (fun log -> {log with labels})

let add_label label =
  update (fun log -> {log with labels= log.labels @ [label]})

let with_code code = update (fun log -> {log with code= Some code})

let with_primary_label primary_label =
  update (fun log -> {log with primary_label= Some primary_label})

let error ~code = mk ~level:`Error ~code:(Some code)

let warning ~code = mk ~level:`Warning ~code:(Some code)

let debug ~code = mk ~level:`Debug ~code:(Some code)

let message log = (Mark.remove log).message

let level log = (Mark.remove log).level

let equal_err log (err_code, _) =
  let log = Mark.remove log in
  match log.code with
  | Some code ->
      Err.Code.equal code err_code
  | None ->
      false
