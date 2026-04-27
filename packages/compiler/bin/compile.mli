open Cmdliner

type t =
  { output_file: string
  ; input_files: string list
  ; output_type: Compiler.target_type
  ; default_to_public: bool }

val compile_files :
     input_files:string list
  -> output_type:Compiler.target_type
  -> output_file:string
  -> default_to_public:bool
  -> Cmd.Exit.code

val compile_target : t -> Cmd.Exit.code

val compile_targets : t list -> Cmd.Exit.code
