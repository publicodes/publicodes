open Sedlexing
open Tokens
open Core

type lexing_context = Reference | Expression [@@deriving show]

let code_buffer : Buffer.t option ref = ref None

let start_pos : (Lexing.position * Lexing.position) ref =
  ref (Lexing.dummy_pos, Lexing.dummy_pos)

(* Spaces *)
let space_plus = [%sedlex.regexp? Plus white_space]
let eol = [%sedlex.regexp? Opt '\r', '\n']
let hspace = [%sedlex.regexp? Sub (white_space, Chars "\n\r")]

(* Chars *)
let digit = [%sedlex.regexp? '0' .. '9']
let letter = [%sedlex.regexp? 'a' .. 'z' | 'A' .. 'Z' | 0x00C0 .. 0x017F | '$']
let symbol = [%sedlex.regexp? Chars ",°$%²_\"«»'" | "€"]
let char = [%sedlex.regexp? letter | symbol | digit]
let any_char = [%sedlex.regexp? char | Chars "+-#"]

(* Number *)
let number = [%sedlex.regexp? Plus digit, Opt ('.', Plus digit)]
let unit_symbol = [%sedlex.regexp? 0x20A0 .. 0x20CF | Chars "°%"]

let unit_identifier =
  [%sedlex.regexp?
    (letter | unit_symbol), Star any_char, Star (hspace, char, Star any_char)]

let number_with_unit =
  [%sedlex.regexp?
    ( number,
      Opt hspace,
      Opt '/',
      unit_identifier,
      Star (Opt hspace, Chars "./", unit_identifier) )]

(* RuleName *)
let rule_name =
  [%sedlex.regexp? letter, Star any_char, Star (hspace, char, Star any_char)]

let string = [%sedlex.regexp? '"', Star any, '"' | '\'', Star any, '\'']

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

let rec lex (lexbuf : lexbuf) : token =
  (* let prev_lexeme = Utf8.lexeme lexbuf in
  let prev_pos = lexing_positions lexbuf in *)
  match%sedlex lexbuf with
  | space_plus ->
      update_acc lexbuf;
      lex lexbuf
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
  | "oui" ->
      update_acc lexbuf;
      BOOLEAN true
  | "non" ->
      update_acc lexbuf;
      BOOLEAN false
  | date -> (
      update_acc lexbuf;
      lexbuf |> Utf8.lexeme |> String.split ~on:'/' |> function
      | [ mm; yyyy ] ->
          DATE_LITERAL (`Month (int_of_string mm, int_of_string yyyy))
      | [ dd; mm; yyyy ] ->
          DATE_LITERAL
            (`Day (int_of_string dd, int_of_string mm, int_of_string yyyy))
      | _ -> raise (Invalid_argument "Invalid token"))
  | number_with_unit ->
      update_acc lexbuf;
      let str = Utf8.lexeme lexbuf in
      let number_part =
        String.take_while ~f:(fun c -> Char.is_digit c || Char.equal c '.') str
      in
      let unit_part =
        let with_space = String.drop_prefix str (String.length number_part) in
        if String.is_prefix with_space ~prefix:" " then
          String.drop_prefix with_space 1
        else with_space
      in
      let number = float_of_string number_part in
      NUMBER (number, Some unit_part)
  | number ->
      update_acc lexbuf;
      let number = lexbuf |> Utf8.lexeme |> float_of_string in
      NUMBER (number, None)
  | string ->
      update_acc lexbuf;
      let str = String.slice (Utf8.lexeme lexbuf) 1 (-1) in
      STRING str
  | rule_name ->
      update_acc lexbuf;
      RULE_NAME (Utf8.lexeme lexbuf)
  | _ -> raise (Invalid_argument "Invalid token")
