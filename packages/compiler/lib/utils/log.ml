open Core

type kind = [`Yaml | `Lex | `Syntax | `Type | `Cycle]
[@@deriving show, sexp, compare]

type level = [`Error | `Warning | `Info] [@@deriving show, sexp, compare]

type log = {kind: kind; level: level; message: string; hint: string option}
[@@deriving show, sexp, compare]

type t = log Pos.t [@@deriving show, sexp, compare]

let error ~pos ~kind ?hint message =
  Pos.mk pos {kind; level= `Error; message; hint}

let warning ~pos ~kind ?hint message =
  Pos.mk pos {kind; level= `Warning; message; hint}

let info ~pos ~kind ?hint message =
  Pos.mk pos {kind; level= `Info; message; hint}

let message log = (Pos.value log).message
