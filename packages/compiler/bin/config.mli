type target_type = [`Js | `Debug_eval_tree]

type target =
  { output_file: string
  ; input_files: string list
  ; output_type: target_type
  ; default_to_public: bool }

type config = {targets: target list}

val parse_yaml : in_channel -> (config, [`Msg of string]) result
(** [pare_yaml in_channel] parse a config from a yaml channel *)

val parse : string -> (config, [`Msg of string]) result
(** [pare config] parse a config from a file path. The parser is guessed
		from the file extension. *)

val compile_target : target -> int
(** [compile target] compile a target, and returns a code *)

val compile_targets : target list -> int
(** [compile_targets targets] compile all targets, or until the first
		failing one, and returns zero, or the first non zero code *)

val compile : config -> int
(** [compile config] compile all config targets, or until the first failing
		one, and returns zero, or the first non zero code *)

val parse_compile : string -> (int, [`Msg of string]) result
(** [parse_compile config] convenient method to parse and compile from a
		file path. *)
