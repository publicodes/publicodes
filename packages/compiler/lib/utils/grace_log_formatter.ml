open Base
open! Grace

let pos_to_range (pos : Pos.t) : Range.t =
  let source, index_start, index_end =
    if File.is_std pos.file then
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
  let primary_label = Label.primary ~range:(pos_to_range pos) message in
  let labels =
    primary_label
    :: List.map log.labels ~f:(fun label ->
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
  in
  create ~labels ~code:log.code severity message

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
        ; single_secondary_caret= "˘" }
    ; styles=
        { Grace_ansi_renderer.Config.default.styles with
          header_error= [`Faint; `Fg (`Hi `Red)]
        ; header_warning= [`Faint; `Fg (`Hi `Yellow)]
        ; header_message= [`Bold]
        ; source_border= [`Fg (`Hi `Black)]
        ; primary_label_error= [`Fg (`Hi `Red)]
        ; secondary_label= [`Fg (`Hi `Cyan)]
        ; line_number= [`Fg (`Hi `Black)] } }
  in
  Grace_ansi_renderer.pr_diagnostic ~config ~code_to_string diagnostic ;
  Stdlib.Format.print_newline () ;
  Stdlib.Format.print_newline ()
