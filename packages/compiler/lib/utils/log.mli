(** [Log] module provides a structured logging system for the compiler.
    It supports different kinds and levels of log messages, with facilities
    for error reporting and diagnostic information. *)

(** The kind of log message, indicating which phase of the compilation process
    generated the message:
    - [`Yaml]: YAML parsing errors
    - [`Lex]: Lexical analysis errors
    - [`Syntax]: Syntax/parsing errors
    - [`Type]: Type checking errors
    - [`Cycle]: Cycle detection errors
    - [`Global]: General/global errors
    - [`Replace]: Replacement errors *)
type kind = [`Yaml | `Lex | `Syntax | `Type | `Cycle | `Global | `Replace]
[@@deriving show, sexp, compare]

(** The severity level of the log message:
    - [`Error]: Fatal errors that prevent compilation
    - [`Warning]: Non-fatal issues that should be addressed
    - [`Debug]: Informational messages for debugging purposes *)
type level = [`Error | `Warning | `Debug] [@@deriving show, sexp, compare]

type log =
  { kind: kind
  ; level: level
  ; message: string (* ; labels: string Pos.t list *)
  ; hints: string list
  ; labels: string Pos.t list
  ; code: Err.Code.t option }
[@@deriving show, sexp, compare]

type t = log Pos.t [@@deriving show, sexp, compare]

val error :
     code:Err.Code.t
  -> ?kind:kind
  -> ?pos:Pos.pos
  -> ?hints:string list
  -> ?labels:string Pos.t list
  -> string
  -> t
(** [error ~code ?kind ?pos ?hints message] creates an error log with the given error code,
    optional kind (defaults to [`Global]), position (defaults to [Pos.dummy]),
    hints for resolving the error, and the error message. *)

val warning :
     code:Err.Code.t
  -> ?kind:kind
  -> ?pos:Pos.pos
  -> ?hints:string list
  -> ?labels:string Pos.t list
  -> string
  -> t
(** [warning ~code ?kind ?pos ?hints message] creates a warning log with the given error code,
    optional kind (defaults to [`Global]), position (defaults to [Pos.dummy]),
    hints for addressing the warning, and the warning message. *)

val debug :
     code:Err.Code.t
  -> ?kind:kind
  -> ?pos:Pos.pos
  -> ?hints:string list
  -> ?labels:string Pos.t list
  -> string
  -> t
(** [warning ~code ?kind ?pos ?hints message] creates a debug log with the given error code,
        optional kind (defaults to [`Global]), position (defaults to [Pos.dummy]),
        hints for addressing the warning, and the warning message. *)

val message : t -> string
(** [message log] extracts the message string from a log entry. *)

val level : t -> level
(** [level log] gets the severity level of a log entry. *)
