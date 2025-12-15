open Yaml_parser

(** Type for the parse value function.

    - [error_if_undefined]: optional flag to control error reporting for undefined values
    - [pos]: the position in the source file for error reporting
    - [yaml]: the YAML value to parse

    And returns the parsed AST value wrapped in an [Output.t] for error handling.
*)
type parse_value_fn =
  ?error_if_undefined:bool -> pos:Pos.pos -> yaml -> Ast.value Output.t

(** Type for parsing mechanism functions.

    A [parse_meca] is a function that takes:
    - [pos]: the position in the source file for error reporting
    - [parse]: a recursive parsing function that can parse YAML values into AST values
    - [yaml]: the YAML value to parse

    And returns the parsed mechanism wrapped in an [Output.t] for error handling.

    The ['a] type parameter represents the specific mechanism type being parsed
    (e.g., [value_mechanism] or [chainable_mechanism]).
*)
type 'a parse_meca = pos:Pos.pos -> parse:parse_value_fn -> yaml -> 'a Output.t
