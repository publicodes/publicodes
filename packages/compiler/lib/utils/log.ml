open Core

type kind = Yaml | Lex | Syntax | Type [@@deriving show, sexp, compare]
type level = Err | Warning | Info [@@deriving show, sexp, compare]

type log = {
  kind : kind;
  level : level;
  message : string;
  hint : string option;
}
[@@deriving show, sexp, compare]

type t = log With_pos.t [@@deriving show, sexp, compare]
