module Ast = struct
  include Ast
end

(** [pase_files ~default_to_public ~module_path input_files] parses the given
    [input_files] and returns the corresponding AST with possible log messages.

    [default_to_public] determines whether rules without an explicit visibility
    tag should be treated as public or private. *)
let parse_files = Parse.from_files
