(** This is the driver module for the Publicodes compiler. *)

(** Compiler configuration context, which includes:
    - [input_files]: a list of input files that contain the Publicodes model to
      be compiled.
    - [module_path]: the current module path (i.e., the directory containing the
      input files).
    - [output_type]: the type of output to generate.
    - [default_to_public]: a boolean flag indicating whether rules without an
      explicit visibility tag should be treated as public or private. *)
type t =
  { input_files: string list
  ; module_path: string
  ; output_type: target_type
  ; default_to_public: bool }

(** The different output types that the compiler can generate:
    - {!Js}: generates a JS file corresponding to the Publicodes model with the
      inlined runtime. This is the default output type.
    - {!Debug_eval_tree}: generates a simplified representation of the
      {!Hashed_tree.t} (the last internal representation) for debugging and test
      purposes.
    - {!Debug_typed_eval_tree}: same as {!Debug_eval_tree} but with the types of
      each node in the tree.
    - {!Json}: generates a JSON representation of the
    {!Shared.Shared_ast.resolved} AST for documentation and tooling purposes. *)
and target_type = Js | Json | Debug_eval_tree | Debug_typed_eval_tree

val compile : t -> string Utils.Output.t
(** [compile target] compiles the Publicodes model specified by the [target]
    configuration and returns the corresponding string representation of the
    compiled output with the possible logs. *)
