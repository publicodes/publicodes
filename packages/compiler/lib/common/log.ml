type kind = Lex | Syntax | Type
type level = Error | Warning | Info

type log = {
  kind : kind;
  level : level;
  message : string;
  hint : string option;
}

type t = log With_pos.t
