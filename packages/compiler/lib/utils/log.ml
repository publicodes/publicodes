open Core

type kind = [`Yaml | `Lex | `Syntax | `Type | `Cycle]
[@@deriving show, sexp, compare]

type level = [`Error | `Warning | `Info] [@@deriving show, sexp, compare]

type log = {kind: kind; level: level; message: string; hint: string option}
[@@deriving show, sexp, compare]

type t = log Pos.t [@@deriving show, sexp, compare]

let error ~pos ~kind ?hint message =
  Pos.mk ~pos {kind; level= `Error; message; hint}

let warning ~pos ~kind ?hint message =
  Pos.mk ~pos {kind; level= `Warning; message; hint}

let info ~pos ~kind ?hint message =
  Pos.mk ~pos {kind; level= `Info; message; hint}

let message log = (Pos.value log).message

(** Needed to avoid [Grace] raising exceptions when the range have a length of
    zero. *)
let normalize_range start stop =
  if phys_equal start stop then
    if phys_equal start 0 (* NOTE: need to have the source length maybe? *) then
      (start, stop + 1)
    else (start - 1, stop)
  else (start, stop)

let to_diagnostic log_with_pos =
  let open Grace in
  let pos = Pos.pos log_with_pos in
  let log = Pos.value log_with_pos in
  let content = File.read_file pos.file in
  let source = `String Source.{name= Some pos.file; content} in
  let range start stop =
    let start, stop = normalize_range start stop in
    Range.create ~source (Byte_index.of_int start) (Byte_index.of_int stop)
  in
  let severity =
    match log.level with
    | `Error ->
        Diagnostic.Severity.Error
    | `Warning ->
        Diagnostic.Severity.Warning
    | `Info ->
        Diagnostic.Severity.Note
  in
  let labels =
    Diagnostic.Label.
      [ primaryf
          ~range:(range pos.start_pos.index pos.end_pos.index)
          "%s" log.message ]
  in
  Diagnostic.(
    createf ~labels ~code:Code_error.Empty_mechanism severity "%s" log.message )

let ansi_renderer =
  Grace_ansi_renderer.pp_compact_diagnostic
    ~code_to_string:Code_error.code_to_string ()
