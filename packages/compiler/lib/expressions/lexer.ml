open Sedlexing
open Tokens

type lexing_context = Reference | Expression [@@deriving show]

let code_buffer : Buffer.t option ref = ref None

let start_pos : (Lexing.position * Lexing.position) ref =
  ref (Lexing.dummy_pos, Lexing.dummy_pos)

let digit = [%sedlex.regexp? '0' .. '9']
let space_plus = [%sedlex.regexp? Plus white_space]
let eol = [%sedlex.regexp? Opt '\r', '\n']
let hspace = [%sedlex.regexp? Sub (white_space, Chars "\n\r")]

let update_acc (lexbuf : lexbuf) : unit =
  match !code_buffer with
  | None -> failwith "Lexer update outside of a lexing context"
  | Some buf -> Buffer.add_string buf (Utf8.lexeme lexbuf)

let lex (lexbuf : lexbuf) : token =
  (* let prev_lexeme = Utf8.lexeme lexbuf in
  let prev_pos = lexing_positions lexbuf in *)
  match%sedlex lexbuf with
  | "+" ->
      update_acc lexbuf;
      ADD
  | "-" ->
      update_acc lexbuf;
      SUB
  | "*" ->
      update_acc lexbuf;
      MUL
  | "/" ->
      update_acc lexbuf;
      DIV
  | "**" ->
      update_acc lexbuf;
      POW
  | ">" ->
      update_acc lexbuf;
      GT
  | "<" ->
      update_acc lexbuf;
      LT
  | ">=" ->
      update_acc lexbuf;
      GTE
  | "<=" ->
      update_acc lexbuf;
      LTE
  | "=" ->
      update_acc lexbuf;
      EQ
  | "!=" ->
      update_acc lexbuf;
      NEQ
  | "(" ->
      update_acc lexbuf;
      LPAREN
  | ")" ->
      update_acc lexbuf;
      RPAREN
  | " . " ->
      update_acc lexbuf;
      DOT
  | Opt (Rep (digit, 2), '/'), Rep (digit, 2), '/', Rep (digit, 4) ->
      update_acc lexbuf;
      DATE_LITERAL
        ( int_of_string (Utf8.lexeme lexbuf),
          int_of_string (Utf8.lexeme lexbuf),
          int_of_string (Utf8.lexeme lexbuf) )
  | _ -> raise (Invalid_argument "Invalid token")
