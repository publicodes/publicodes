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
[@@deriving equal]

(** The severity level of the log message:
    - [`Error]: Fatal errors that prevent compilation
    - [`Warning]: Non-fatal issues that should be addressed
    - [`Debug]: Informational messages for debugging purposes
    - [`Bug]: Internal compiler bugs that should be reported *)
type level = [`Error | `Warning | `Debug | `Bug] [@@deriving equal]

type log =
  { kind: kind
  ; level: level
  ; message: string
  ; primary_label: string option
  ; labels: string Mark.pos list
  ; hints: string list
  ; code: Err.Code.t option }
[@@deriving equal]

type t = log Mark.pos [@@deriving equal]

val compare : t -> t -> int

(** {2 Log creation functions} *)

val error :
     code:Err.Code.t
  -> ?kind:kind
  -> ?pos:Pos.t
  -> ?hints:string list
  -> ?labels:string Mark.pos list
  -> ?primary_label:string option
  -> string
  -> t
(** [error ~code ?kind ?pos ?hints message] creates an error log with the given error code,
    optional kind (defaults to [`Global]), position (defaults to [Pos.dummy]),
    hints for resolving the error, and the error message. *)

val warning :
     code:Err.Code.t
  -> ?kind:kind
  -> ?pos:Pos.t
  -> ?hints:string list
  -> ?labels:string Mark.pos list
  -> ?primary_label:string option
  -> string
  -> t
(** [warning ~code ?kind ?pos ?hints message] creates a warning log with the given error code,
    optional kind (defaults to [`Global]), position (defaults to [Pos.dummy]),
    hints for addressing the warning, and the warning message. *)

val debug :
     code:Err.Code.t
  -> ?kind:kind
  -> ?pos:Pos.t
  -> ?hints:string list
  -> ?labels:string Mark.pos list
  -> ?primary_label:string option
  -> string
  -> t
(** [debug ~code ?kind ?pos ?hints message] creates a debug log with the given error code,
        optional kind (defaults to [`Global]), position (defaults to [Pos.dummy]),
        hints for addressing the warning, and the warning message. *)

(** {3 Pipe pattern functions for log creation}

  TODO: refactor log creation to force the use of pipe pattern for better
  readability and maintainability. *)

val with_kind : kind -> t -> t
(** [with_kind kind log] sets the kind of the log entry. *)

val with_level : level -> t -> t
(** [with_level level log] sets the severity level of the log entry. *)

val with_message : string -> t -> t
(** [with_message message log] sets the message of the log entry. *)

val with_hints : string list -> t -> t
(** [with_hints hints log] sets the hints of the log entry. *)

val add_hint : string -> t -> t
(** [add_hint hint log] adds a hint to the log entry. *)

val with_labels : string Mark.pos list -> t -> t
(** [with_labels labels log] sets the labels of the log entry. *)

val add_label : string Mark.pos -> t -> t
(** [add_label label log] adds a label to the log entry. *)

val with_code : Err.Code.t -> t -> t
(** [with_code code log] sets the error code of the log entry. *)

val with_primary_label : string -> t -> t
(** [with_primary_label label log] sets the primary label of the log entry. *)

(** {2 Accessor functions for log entries} *)

val message : t -> string
(** [message log] extracts the message string from a log entry. *)

val level : t -> level
(** [level log] gets the severity level of a log entry. *)

val equal_err : t -> Err.t -> bool
(** [equal_err log err] checks if the log entry corresponds to the given error code. *)
