(** Pretty printer for evaluation trees with colorful terminal output *)

open Eval_tree

(** Print a single value to stdout with colors *)
val print_value : ?show_pos:bool -> 'meta value -> unit

(** Print an entire evaluation tree to stdout with colors *)
val print_eval_tree : ?show_pos:bool -> 'meta t -> unit

(** Convert a single value to a formatted string (no colors) *)
val to_string_value : ?show_pos:bool -> 'meta value -> string

(** Convert an entire evaluation tree to a formatted string (no colors) *)
val to_string_eval_tree : ?show_pos:bool -> 'meta t -> string