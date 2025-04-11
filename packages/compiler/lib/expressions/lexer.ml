open Sedlexing
open Tokens
open Core

type lexing_context = Reference | Expression [@@deriving show]

let code_buffer : Buffer.t option ref = ref None

let start_pos : (Lexing.position * Lexing.position) ref =
  ref (Lexing.dummy_pos, Lexing.dummy_pos)

let digit = [%sedlex.regexp? '0' .. '9']
let space_plus = [%sedlex.regexp? Plus white_space]
let eol = [%sedlex.regexp? Opt '\r', '\n']
let hspace = [%sedlex.regexp? Sub (white_space, Chars "\n\r")]
let number = [%sedlex.regexp? Plus digit, Opt ('.', Plus digit)]
let string = [%sedlex.regexp? '"', Star any, '"' | '\'', Star any, '\'']
let letter = [%sedlex.regexp? 'a' .. 'z' | 'A' .. 'Z' | 0x00C0 .. 0x017F | '$']
let symbol = [%sedlex.regexp? Chars ",°$%²_\"«»'" | "€"]
let char = [%sedlex.regexp? letter | symbol | number]
let any_char = [%sedlex.regexp? char | Chars "+-#"]

let rule_name =
  [%sedlex.regexp? letter, Star any_char, Star (hspace, char, Star any_char)]

let date =
  [%sedlex.regexp?
    Opt (Rep (digit, 2), '/'), Rep (digit, 2), '/', Rep (digit, 4)]

let update_acc (lexbuf : lexbuf) : unit =
  let _ = Utf8.lexeme lexbuf in
  ()
(* match !code_buffer with
  | None -> failwith "Lexer update outside of a lexing context"
  | Some buf -> Buffer.add_string buf (Utf8.lexeme lexbuf) *)

let print x =
  Printf.printf "%s\n" x;
  x

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
  | date -> (
      update_acc lexbuf;
      lexbuf |> Utf8.lexeme |> String.split ~on:'/' |> function
      | [ mm; yyyy ] ->
          DATE_LITERAL (`Month (int_of_string mm, int_of_string yyyy))
      | [ dd; mm; yyyy ] ->
          DATE_LITERAL
            (`Day (int_of_string dd, int_of_string mm, int_of_string yyyy))
      | _ -> raise (Invalid_argument "Invalid token"))
  | number ->
      update_acc lexbuf;
      let number = lexbuf |> Utf8.lexeme |> float_of_string in
      NUMBER number
  | string ->
      update_acc lexbuf;
      let str = String.slice (Utf8.lexeme lexbuf) 1 (-1) in
      STRING str
  | rule_name -> RULE_NAME (Utf8.lexeme lexbuf)
  | _ -> raise (Invalid_argument "Invalid token")
