module Ast = struct
  include Ast
end

(** [pase_files ~default_to_public ~module_path input_files] parses the given
    [input_files] and returns the corresponding AST with possible log messages.

    [default_to_public] determines whether rules without an explicit visibility
    tag should be treated as public or private. *)
let parse_files = Parse.parse_root

(** NOTE(@EmileRolley): there is something weird with the [Parser] architecture,
    the [parse_root] is defined in [parse.ml] as the recursive part of [parse],
    but there is also a [parse_files] in [parser.ml].

    All parsing functions should be defined in [parse.ml] and avoid indirection
    with [parse_<something>] and therefore [parser_utils.ml]. *)
