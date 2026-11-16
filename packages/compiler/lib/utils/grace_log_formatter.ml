open Base
open! Grace

let pos_to_range (pos : Pos.t) : Range.t =
  let source, index_start, index_end =
    if File.is_std pos.file then
      (* FIXME: [File.t] should contains the file content to be able to read
         again the stdin content. *)
      ( `String Source.{name= None; content= ""}
      , Byte_index.of_int 0
      , Byte_index.of_int 0 )
    else
      (* TODO: file content should be cached from the parser to avoid reading
         the file again. *)
      (* NOTE: we need to read the file the same way as we did in the parser,
         otherwise the byte indices will not match. *)
      let content = File.read_file pos.file in
      let filepath = File.to_intern pos.file in
      ( `String Source.{name= Some filepath; content}
      , Byte_index.of_int pos.start_pos.index
      , Byte_index.of_int pos.end_pos.index )
  in
  Range.create ~source index_start index_end

let to_diagnostic (log : Log.t) =
  let open Diagnostic in
  let pos = Mark.pos log in
  let log = Mark.remove log in
  let message = Message.create log.message in
  let notes = List.map log.hints ~f:(fun h -> Message.create ("(aide) " ^ h)) in
  let primary_labels =
    match log.primary_label with
    | Some label ->
        let message = Message.create label in
        [Label.primary ~range:(pos_to_range pos) message]
    | None ->
        (* FIXME: logs should have optionnal pos instead of using [Pos.dummy]. *)
        if List.is_empty log.labels && not (Pos.equal pos Pos.dummy) then
          [Label.primary ~range:(pos_to_range pos) message]
        else []
  in
  let labels =
    primary_labels
    @ List.map log.labels ~f:(fun label ->
        let pos = Mark.pos label in
        let label = Mark.remove label in
        let range = pos_to_range pos in
        Label.secondary ~range (Message.create label) )
  in
  let severity =
    match log.level with
    | `Error ->
        Severity.Error
    | `Warning ->
        Severity.Warning
    | `Debug ->
        Severity.Note
    | `Bug ->
        Severity.Bug
  in
  create ~code:log.code ~labels ~notes severity message

let print log =
  let diagnostic = to_diagnostic log in
  let code_to_string = function
    | None ->
        ""
    | Some code ->
        Err.Code.show code
  in
  let config =
    { Grace_ansi_renderer.Config.default with
      num_contextual_lines= 1
    ; enable_inline_contextual_lines= true
    ; chars=
        { Grace_ansi_renderer.Config.default.chars with
          snippet_start= "╒══"
        ; single_secondary_caret= "˘"
        ; note_bullet= "=" }
    ; styles=
        { Grace_ansi_renderer.Config.default.styles with
          primary_label_error= [`Bold; `Fg (`Hi `Red)]
        ; line_number= [`Fg (`Hi `Blue)]
        ; source_border= [`Fg (`Hi `Blue)]
        ; secondary_label= [`Bold; `Fg (`Hi `Blue)] } }
  in
  Grace_ansi_renderer.pr_diagnostic ~config ~code_to_string diagnostic ;
  Stdlib.Format.print_newline () ;
  Stdlib.Format.print_newline ()
