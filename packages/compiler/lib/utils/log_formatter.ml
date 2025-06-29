open Core
open Global
open Pp
module Style = Pp_tty.Style

let tag = Pp_tty.tag

let config = function
  | Style.Loc ->
      [`Bold; `Fg_blue]
  | Error ->
      [`Bold; `Fg_red]
  | Warning ->
      [`Bold; `Fg_yellow]
  | Kwd ->
      [`Bold; `Fg_blue]
  | Prompt ->
      [`Bold; `Fg_green]
  | Hint ->
      [`Italic]
  | Details ->
      [`Dim]
  | Ok ->
      [`Fg_green]
  | Debug ->
      [`Underline; `Fg_bright_cyan]
  | Success ->
      [`Bold; `Fg_green]
  | Id ->
      [`Bold; `Fg_yellow]
  | Ansi_styles l ->
      l

let tdecoration = Pp_tty.tag Pp_tty.Style.Details

let tposition = Pp_tty.tag Pp_tty.Style.Loc

let thint = Pp_tty.tag Pp_tty.Style.Hint

(* Helper function to create a text document *)

(* Helper function to read file content *)
let read_file_lines filename =
  try
    let ic = In_channel.create filename in
    let lines = In_channel.input_lines ic in
    In_channel.close ic ; Some lines
  with _ -> None

(* Format a position as "filename:line:column" for IDE clickability *)
let format_position (pos : Pos.pos) =
  if Pos.is_empty_file pos then text "<unknown>"
  else
    let file = pos.file in
    let start_line = pos.start_pos.line in
    let start_col = pos.start_pos.column in
    textf "%s:%d:%d" file start_line start_col

let get_code_line ?message ~level ~line ~line_start ~line_end ~display_start
    ~display_end ~col_start ~col_end ~indent content =
  if line >= display_start && line <= display_end then
    (* Create the line document with indentation and content *)
    let indent_colnum = String.make (max 0 (indent - length_of_int line)) ' ' in
    let in_error = line >= line_start && line <= line_end in
    let line_colnum =
      (if in_error then tag level else tdecoration)
        (textf " %s%d | " indent_colnum line)
    in
    let line_content =
      if in_error then
        (* Split the line into before, error part, and after *)
        let line_utf = String.Utf8.sanitize content in
        let line_len = String.Utf8.length_in_uchars line_utf in
        let sub str ~pos ~len =
          let array = String.Utf8.to_array str in
          Array.sub array ~pos ~len |> String.Utf8.of_array
          |> String.Utf8.to_string
        in
        let col_start =
          if line = line_start then min (col_start - 1) line_len else 0
        in
        let col_end =
          if line = line_end then min col_end line_len else line_len
        in
        let message =
          match message with
          | Some log ->
              concat [text " "; text log]
          | None ->
              nop
        in
        vbox
        @@ concat
             [ hbox
                 (concat
                    [ line_colnum
                    ; text (sub line_utf ~pos:0 ~len:col_start)
                    ; text
                        (sub line_utf ~pos:col_start ~len:(col_end - col_start))
                    ; text (sub line_utf ~pos:col_end ~len:(line_len - col_end))
                    ; cut ] )
             ; cut
             ; hbox
                 (concat
                    [ tdecoration (textf " %s | " (String.make indent ' '))
                    ; text (String.make col_start ' ')
                    ; hbox
                        (tag level
                           (concat
                              [ text
                                  (String.concat
                                     (List.init (col_end - col_start)
                                        ~f:(fun _ -> "^" ) ) )
                              ; message ] ) ) ] ) ]
      else seq line_colnum (text content)
    in
    let doc = hbox line_content in
    Some doc
  else None

(* Format code excerpt with the problematic part tagged based on level *)
let format_code_excerpt ?message ?(show_filepath : bool = true) ~(pos : Pos.pos)
    ~(numpos_width : int) level =
  if Pos.is_empty_file pos then text "<no source available>"
  else
    let indent = String.make (numpos_width + 1) ' ' in
    let location =
      concat ~sep:newline
        [ hbox
            (concat
               [ tdecoration (text (indent ^ "--> "))
               ; tposition (format_position pos) ] )
        ; hbox (tdecoration (text (indent ^ " |"))) ]
    in
    match read_file_lines pos.file with
    | None ->
        hbox @@ text "<could not read source file>"
    | Some lines ->
        let line_start = pos.start_pos.line in
        let line_end = pos.end_pos.line in
        let col_start = pos.start_pos.column in
        let col_end = pos.end_pos.column in
        (* Get the line range to display, with context *)
        let display_start = max 1 (line_start - 1) in
        let display_end = min (List.length lines) line_end in
        let code_lines =
          List.filter_mapi lines ~f:(fun i line ->
              let line_num = i + 1 in
              get_code_line line ?message ~level ~line:line_num ~line_start
                ~line_end ~display_start ~display_end ~col_start ~col_end
                ~indent:numpos_width )
        in
        (* Combine all line documents *)
        vbox
        @@ concat ~sep:cut
             (if show_filepath then location :: code_lines else code_lines)

(* Format the level with appropriate styling *)
let format_level level =
  match level with
  | `Error ->
      text "Erreur"
  | `Warning ->
      text "AVERTISSEMENT"
  | `Debug ->
      text "DEBUG"

(* Format the kind with appropriate styling *)
let format_kind kind =
  let kind_str =
    match kind with
    | `Lex | `Yaml ->
        "d'écriture"
    | `Syntax ->
        "syntaxique"
    | `Type ->
        "des types de données"
    | `Cycle ->
        "de cycle de dépendance"
    | `Global ->
        "générale"
  in
  text kind_str

(* Format error code if present *)
let format_error_code code =
  match code with
  | None ->
      nop
  | Some code ->
      tdecoration @@ concat [text (Err.Code.to_string code)]

(* Format hints *)
let format_hints hints =
  if List.is_empty hints then nop
  else
    let hint_docs = enumerate hints ~f:(fun hint -> thint (text hint)) in
    hvbox
      (concat ~sep:newline
         [ hbox
             (concat
                [newline; tag Style.Prompt (text "Aide"); tdecoration (text ":")] )
         ; hint_docs ] )

let print (log : Log.t) =
  let position = Pos.pos log in
  let Log.{kind; level; hints; code; labels; message} = Pos.value log in
  let numpos_width =
    match labels with
    | [] ->
        length_of_int position.start_pos.line
    | labels ->
        List.fold labels ~init:0 ~f:(fun acc (_, pos) ->
            max acc (length_of_int pos.start_pos.line) )
  in
  let level_tag =
    match level with
    | `Debug ->
        Pp_tty.Style.Debug
    | `Warning ->
        Pp_tty.Style.Warning
    | `Error ->
        Pp_tty.Style.Error
  in
  let header =
    hbox
      (concat ~sep:space
         [ Pp_tty.tag level_tag (text "---|")
           (* [ Pp_tty.tag level_tag (text "━━┫") *)
         ; Pp_tty.tag level_tag (format_level level)
         ; Pp_tty.tag level_tag (format_kind kind)
         ; tdecoration @@ concat [Pp_tty.parens (format_error_code code)]
         ; Pp_tty.tag level_tag (text "|----------------------------------") ] )
  in
  let code_excerpt =
    format_code_excerpt ~pos:position ~numpos_width level_tag
  in
  let lables_excerpts =
    vbox
      (concat ~sep:cut
         ( match labels with
         | [] ->
             [format_code_excerpt ~numpos_width ~pos:position level_tag]
         | labels ->
             labels
             |> List.group ~break:(fun l l' ->
                    0 <> String.compare (Pos.pos l).file (Pos.pos l').file )
             |> List.map ~f:(fun labels ->
                    List.sort labels ~compare:(fun (_, pos1) (_, pos2) ->
                        Pos.compare_pos pos1 pos2 )
                    |> List.mapi ~f:(fun i (message, pos) ->
                           format_code_excerpt level_tag ~numpos_width ~pos
                             ~message ~show_filepath:(i = 0) ) )
             |> List.concat ) )
    (* |> List.mapi ~f:(fun labels -> *)
    (*        (* For each label, format the code excerpt with the message *) *)
    (*        format_code_excerpt ~numpos_width ~pos ~message level_tag ) *)
    (* |> List.sort_and_group ~compare:(fun (_, pos1) (_, pos2) -> *)
    (*        Pos.compare_pos pos1 pos2 ) *)
    (* |> List.map ~f:(fun (message, pos) -> *)
    (*        format_code_excerpt ~numpos_width ~pos ~message level_tag ) *)
  in
  let hints_doc = format_hints hints in
  (* Create the complete document *)
  let doc =
    vbox
      (concat
         [ newline
         ; header
         ; newline
         ; newline
         ; paragraph message
         ; newline
         ; newline
         ; code_excerpt
         ; newline
         ; lables_excerpts
         ; cut
         ; hints_doc
         ; cut ] )
  in
  (* Print the document to stdout with styled tags *)
  (* to_fmt_with_tags (Format.get_std_formatter ()) doc ~tag_handler:handle_tag ; *)
  Pp_tty.print ~config doc ; Format.print_flush ()
