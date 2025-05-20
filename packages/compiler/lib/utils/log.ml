open Core

type kind = [`Yaml | `Lex | `Syntax | `Type | `Cycle | `Global]
[@@deriving show, sexp, compare]

type level = [`Error | `Warning | `Info] [@@deriving show, sexp, compare]

type log =
  { kind: kind
  ; level: level
  ; message: string
  ; labels: string Pos.t list
  ; hints: string list
  ; code: Err.Code.t option }
[@@deriving show, sexp, compare]

type t = log Pos.t [@@deriving show, sexp, compare]

let mk ~level ?(kind = `Global) ?(pos = Pos.dummy) ?(hints = []) ?(labels = [])
    ?(code = None) message =
  Pos.mk ~pos {kind; level; message; hints; labels; code}

let error ~code = mk ~level:`Error ~code:(Some code)

let warning ~code = mk ~level:`Warning ~code:(Some code)

let info = mk ~level:`Info ~code:None

let message log = (Pos.value log).message

let level log = (Pos.value log).level

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
  let severity =
    match log.level with
    | `Error ->
        Diagnostic.Severity.Error
    | `Warning ->
        Diagnostic.Severity.Warning
    | `Info ->
        Diagnostic.Severity.Note
  in
  let err_kind =
    match log.kind with
    | `Yaml ->
        "yaml"
    | `Lex ->
        "lexical"
    | `Syntax ->
        "syntaxe"
    | `Type ->
        "type"
    | `Cycle ->
        "cycle"
    | `Global ->
        "global"
  in
  if Pos.is_empty_file pos then Diagnostic.(createf severity "%s" log.message)
  else
    let content = File.read_file pos.file in
    let source = `String Source.{name= Some pos.file; content} in
    let range start stop =
      let start, stop = normalize_range start stop in
      Range.create ~source Byte_index.(of_int start) (Byte_index.of_int stop)
    in
    let labels =
      let open Diagnostic.Label in
      if List.is_empty log.labels then
        [ primaryf
            ~range:(range pos.start_pos.index pos.end_pos.index)
            "%s" log.message ]
      else
        List.mapi log.labels ~f:(fun i label ->
            let pos = Pos.pos label in
            let message = Pos.value label in
            (if phys_equal i 0 then primaryf else secondaryf)
              ~range:(range pos.start_pos.index pos.end_pos.index)
              "%s" message )
    in
    let notes = List.map log.hints ~f:Diagnostic.Message.create in
    Diagnostic.(
      createf ~labels ?code:log.code ~notes severity "%s (%s)" log.message
        err_kind )

let ansi_renderer =
  let code_to_string = Err.Code.to_string in
  Grace_ansi_renderer.pp_diagnostic ~code_to_string ()

let print_raw log = Format.printf "%a@." pp log

let print_ansi log =
  try Format.printf "%a@." ansi_renderer (to_diagnostic log)
  with _ -> print_raw log
