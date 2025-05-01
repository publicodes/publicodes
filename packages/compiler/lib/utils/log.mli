(** Logging module for the compiler.

    This module defines the types and functions used for logging messages during
    the compilation process. It includes different kinds of logs, such as
    lexical, syntax, and type errors, along with their severity levels. *)

type kind = Lex | Syntax | Type
type level = Error | Warning | Info

type log = {
  kind : kind;
  level : level;
  message : string;
  hint : string option;
}

type t = log With_pos.t
