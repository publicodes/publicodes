open Shared
open Utils

val from_parsed_ast : Parser.Ast.t -> Shared_ast.resolved Output.t
(** [from_parsed_ast ast] resolves references in the parsed [ast] and returns
    a resolved AST where all references are fully qualified rule names.

    It also performs checks for duplicate rule names, undefined references, and
    orphan rules, returning logs for any issues found. *)
