open Core
open Pp

(* Tag handler for terminal styling *)
let handle_tag formatter tag content =
  let open Format in
  match tag with
  | `Error ->
      pp_print_string formatter "\027[1;31m" ;
      (* bold red *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Warning ->
      pp_print_string formatter "\027[1;33m" ;
      (* bold yellow *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Debug ->
      pp_print_string formatter "\027[1;36m" ;
      (* bold cyan *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Decoration ->
      pp_print_string formatter "\027[38;5;244m" ;
      (* gray *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Position ->
      pp_print_string formatter "\027[1;34m" ;
      (* bold blue *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Hint ->
      pp_print_string formatter "\027[3;2m" ;
      (* italic dim text *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Title ->
      pp_print_string formatter "\027[1m" ;
      (* bold text *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | _ ->
      to_fmt formatter content

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
    (* let end_line = pos.end_pos.line in
    let end_col = pos.end_pos.column in *)
    textf "%s:%d:%d" file start_line start_col

(* Format code excerpt with the problematic part tagged based on level *)
let format_code_excerpt ?message ~(pos : Pos.pos) level =
  if Pos.is_empty_file pos then text "<no source available>"
  else
    let location =
      hbox
        (concat
           [ tag `Decoration @@ text "     ╒══  "
           ; tag `Position @@ format_position pos
           ; tag `Decoration @@ text " ══" ] )
    in
    match read_file_lines pos.file with
    | None ->
        hbox @@ text "<could not read source file>"
    | Some lines ->
        let start_line = pos.start_pos.line in
        let end_line = pos.end_pos.line in
        let start_col = pos.start_pos.column in
        let end_col = pos.end_pos.column in
        (* Get the line range to display, with context *)
        let display_start = max 1 (start_line - 1) in
        let display_end = min (List.length lines) end_line in
        (* Determine tag based on log level *)
        let error_tag = level in
        (* Create a document for each line *)
        let line_docs =
          List.filter_mapi lines ~f:(fun i line ->
              let line_num = i + 1 in
              if line_num >= display_start && line_num <= display_end then
                let line_prefix = tag `Decoration (textf "%4d │ " line_num) in
                let line_content =
                  if line_num >= start_line && line_num <= end_line then
                    (* Split the line into before, error part, and after *)
                    let line_utf = String.Utf8.sanitize line in
                    let line_len = String.Utf8.length_in_uchars line_utf in
                    let sub str ~pos ~len =
                      let array = String.Utf8.to_array str in
                      Array.sub array ~pos ~len |> String.Utf8.of_array
                      |> String.Utf8.to_string
                    in
                    let sc =
                      if line_num = start_line then min (start_col - 1) line_len
                      else 0
                    in
                    let ec =
                      if line_num = end_line then min end_col line_len
                      else line_len
                    in
                    let message =
                      match message with
                      | Some msg ->
                          concat [text " "; text msg]
                      | None ->
                          nop
                    in
                    vbox
                    @@ concat
                         [ hbox
                             (concat
                                [ line_prefix
                                ; text (sub line_utf ~pos:0 ~len:sc)
                                ; text (sub line_utf ~pos:sc ~len:(ec - sc))
                                ; text
                                    (sub line_utf ~pos:ec ~len:(line_len - ec))
                                ; cut ] )
                         ; cut
                         ; hbox
                             (concat
                                [ tag `Decoration (text "     │ ")
                                ; text (String.make sc ' ')
                                ; hbox
                                    (tag error_tag
                                       (concat
                                          [ text
                                              (String.concat
                                                 (List.init (ec - sc)
                                                    ~f:(fun _ -> "˘" ) ) )
                                          ; message ] ) ) ] ) ]
                  else seq line_prefix (text line)
                in
                let doc = hbox line_content in
                Some doc
              else None )
        in
        (* Combine all line documents *)
        vbox @@ concat ~sep:cut (location :: line_docs)

(* Format the level with appropriate styling *)
let format_level level =
  match level with
  | `Error ->
      text "error"
  | `Warning ->
      text "warning"
  | `Debug ->
      text "debug"

(* Format the kind with appropriate styling *)
let format_kind kind =
  let kind_str =
    match kind with
    | `Yaml ->
        "yaml"
    | `Lex ->
        "lexer"
    | `Syntax ->
        "syntax"
    | `Type ->
        "type"
    | `Cycle ->
        "cycle"
    | `Global ->
        "global"
    | `Replace ->
        "replace"
  in
  text kind_str

(* Format error code if present *)
let format_error_code code =
  match code with
  | None ->
      nop
  | Some code ->
      tag `Decoration @@ concat [text (Err.Code.to_string code)]

(* Format hints *)
let format_hints hints =
  if List.is_empty hints then nop
  else
    let hint_docs =
      List.map hints ~f:(fun hint ->
          box ~indent:7
            (seq (tag `Decoration (text " Hint: ")) (tag `Hint (text hint))) )
    in
    vbox (concat ~sep:cut hint_docs)

(* Main function to format a log message *)
let print (log : Log.t) =
  let position = Pos.pos log in
  let Log.{kind; level; message; hints; code; labels} = Pos.value log in
  let level_tag =
    match level with
    | `Debug ->
        `Debug
    | `Warning ->
        `Warning
    | `Error ->
        `Error
  in
  let header =
    box
      (concat
         [ format_error_code code
         ; space
         ; hbox (tag level_tag @@ text message)
         ; space
         ; text "["
         ; format_kind kind
         ; space
         ; format_level level_tag
         ; text "]" ] )
  in
  let code_excerpt =
    vbox
      (concat ~sep:cut
         ( match labels with
         | [] ->
             [format_code_excerpt ~pos:position level_tag]
         | labels ->
             List.map
               ~f:(fun (message, pos) ->
                 format_code_excerpt ~pos ~message level_tag )
               labels ) )
  in
  let hints_doc = format_hints hints in
  (* Create the complete document *)
  let doc = vbox (concat [header; cut; code_excerpt; cut; hints_doc; cut]) in
  (* Print the document to stdout with styled tags *)
  to_fmt_with_tags (Format.get_err_formatter ()) doc ~tag_handler:handle_tag ;
  Format.print_flush ()
