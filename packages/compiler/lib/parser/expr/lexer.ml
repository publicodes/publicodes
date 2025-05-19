open Sedlexing
open Tokens
open Core
open Utils
open Utils.Output

type lexing_context = Reference | Expression [@@deriving show]

let code_buffer : Buffer.t option ref = ref None
(*
let start_pos : (Lexing.position * Lexing.position) ref =
  ref (Lexing.dummy_pos, Lexing.dummy_pos) *)

(* Spaces *)
let space_plus = [%sedlex.regexp? Plus white_space]

let eol = [%sedlex.regexp? Opt '\r', '\n']

let hspace = [%sedlex.regexp? Sub (white_space, Chars "\n\r")]

(* Chars *)
let digit = [%sedlex.regexp? '0' .. '9']

let letter = [%sedlex.regexp? 'a' .. 'z' | 'A' .. 'Z' | 0x00C0 .. 0x017F]

let symbol = [%sedlex.regexp? Chars ",°$%²_\"«»'" | "€"]

let char = [%sedlex.regexp? letter | symbol | digit]

let any_char = [%sedlex.regexp? char | Chars "+-#"]

(* Number *)
let number = [%sedlex.regexp? Plus digit, Opt ('.', Plus digit)]

let unit_symbol =
  [%sedlex.regexp?
    '$' | 0x20A0 .. 0x20CF (* Currencies *) | 0x00A3 (* £ *) | Chars "°%"]

let unit_identifier =
  [%sedlex.regexp?
    (letter | unit_symbol), Star any_char, Star (hspace, char, Star any_char)]

let number_with_unit =
  [%sedlex.regexp?
    ( number
    , Opt hspace
    , Opt '/'
    , unit_identifier
    , Star (Opt hspace, Chars "./", unit_identifier) )]

(* RuleName *)
let rule_name =
  [%sedlex.regexp? letter, Star any_char, Star (hspace, char, Star any_char)]

let string = [%sedlex.regexp? '"', Star any, '"' | '\'', Star any, '\'']

let date =
  [%sedlex.regexp?
    Opt (Rep (digit, 2), '/'), Rep (digit, 2), '/', Rep (digit, 4)]

exception Invalid_token of string

let update_acc (lexbuf : lexbuf) : unit =
  let _ = Utf8.lexeme lexbuf in
  ()

(* match !code_buffer with
  | None -> failwith "Lexer update outside of a lexing context"
  | Some buf -> Buffer.add_string buf (Utf8.lexeme lexbuf) *)

let print x = Printf.printf "%s\n" x ; x

(** [lex_one lexbuf] tokenizes the input [lexbuf] and returns the next token.
    This function recursively processes the input stream, skipping whitespace
    and recognizing patterns for numbers, strings, operators, keywords, dates,
    and rule names.

    @param lexbuf The lexing buffer to tokenize
    @return The next token in the input stream
    @raise Invalid_token if an unrecognized or malformed token is encountered *)
let rec lex_one (lexbuf : lexbuf) : token Pos.t =
  let with_pos token =
    let start_pos, end_pos = Sedlexing.lexing_positions lexbuf in
    let pos =
      Pos.
        { file= start_pos.pos_fname
        ; start_pos= Pos.Point.of_position start_pos
        ; end_pos= Pos.Point.of_position end_pos }
    in
    Pos.mk ~pos token
  in
  match%sedlex lexbuf with
  | space_plus ->
      update_acc lexbuf ; lex_one lexbuf
  | "+" ->
      update_acc lexbuf ; with_pos ADD
  | "-" ->
      update_acc lexbuf ; with_pos SUB
  | "*" ->
      update_acc lexbuf ; with_pos MUL
  | "/" ->
      update_acc lexbuf ; with_pos DIV
  | "**" ->
      update_acc lexbuf ; with_pos POW
  | ">" ->
      update_acc lexbuf ; with_pos GT
  | "<" ->
      update_acc lexbuf ; with_pos LT
  | ">=" ->
      update_acc lexbuf ; with_pos GTE
  | "<=" ->
      update_acc lexbuf ; with_pos LTE
  | "=" ->
      update_acc lexbuf ; with_pos EQ
  | "!=" ->
      update_acc lexbuf ; with_pos NEQ
  | "(" ->
      update_acc lexbuf ; with_pos LPAREN
  | ")" ->
      update_acc lexbuf ; with_pos RPAREN
  | " . " ->
      update_acc lexbuf ; with_pos DOT
  | "oui" ->
      update_acc lexbuf ; with_pos (BOOLEAN true)
  | "non" ->
      update_acc lexbuf ; with_pos (BOOLEAN false)
  | date -> (
      update_acc lexbuf ;
      lexbuf |> Utf8.lexeme |> String.split ~on:'/'
      |> function
      | [mm; yyyy] ->
          with_pos (DATE_LITERAL (`Month (int_of_string mm, int_of_string yyyy)))
      | [dd; mm; yyyy] ->
          with_pos
            (DATE_LITERAL
               (`Day (int_of_string dd, int_of_string mm, int_of_string yyyy))
            )
      | _ ->
          raise (Invalid_token "Invalid date format") )
  | number_with_unit ->
      update_acc lexbuf ;
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
      with_pos (NUMBER (number, Some unit_part))
  | number ->
      update_acc lexbuf ;
      let number = lexbuf |> Utf8.lexeme |> float_of_string in
      with_pos (NUMBER (number, None))
  | string ->
      update_acc lexbuf ;
      let str = String.slice (Utf8.lexeme lexbuf) 1 (-1) in
      with_pos (STRING str)
  | rule_name ->
      update_acc lexbuf ;
      with_pos (RULE_NAME (Utf8.lexeme lexbuf))
  | eof ->
      update_acc lexbuf ; with_pos EOF
  | _ ->
      raise (Invalid_token (Utf8.lexeme lexbuf))

let lex ((publicodes, pos) : string Pos.t) : token Pos.t list Output.t =
  let lexbuf = Utf8.from_string publicodes in
  let file = pos.file in
  Sedlexing.set_position lexbuf (Pos.Point.to_position ~file pos.start_pos) ;
  Sedlexing.set_filename lexbuf file ;
  let rec lex_loop acc =
    try
      let token = lex_one lexbuf in
      match Pos.value token with
      | EOF ->
          return (List.rev (token :: acc))
      | _ ->
          lex_loop (token :: acc)
    with Invalid_token _ ->
      let token_pos =
        let start_pos, end_pos = lexing_positions lexbuf in
        Pos.
          { file
          ; start_pos= Pos.Point.of_position start_pos
          ; end_pos= Pos.Point.of_position end_pos }
      in
      let code, message = Err.expr_lex_invalid_expression in
      fatal_error ~pos:token_pos ~kind:`Lex ~code message
  in
  lex_loop []
