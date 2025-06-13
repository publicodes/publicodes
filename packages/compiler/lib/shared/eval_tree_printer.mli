(** Pretty printer for evaluation trees with colorful terminal output *)

open Eval_tree

val print_value :
     ?show_pos:bool
  -> ?meta_to_string:('meta -> (string * string) list)
  -> 'meta value
  -> unit
(** Print a single value to stdout with colors *)

val print_eval_tree :
     ?show_pos:bool
  -> ?meta_to_string:('meta -> (string * string) list)
  -> 'meta t
  -> unit
(** Print an entire evaluation tree to stdout with colors *)

val to_string_value :
     ?show_pos:bool
  -> ?meta_to_string:('meta -> (string * string) list)
  -> 'meta value
  -> string
(** Convert a single value to a formatted string (no colors) *)

val to_string_eval_tree :
     ?show_pos:bool
  -> ?meta_to_string:('meta -> (string * string) list)
  -> 'meta t
  -> string
(** Convert an entire evaluation tree to a formatted string (no colors) *)
