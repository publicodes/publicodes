open Shared
open Utils

val from_surface_ast : Parser.Ast.t -> Shared_ast.resolved Output.t
(** [from_surface_ast ast] resolves references in the surface [ast] and returns
    a resolved AST where all references are fully qualified rule names.

    It also performs checks for duplicate rule names, undefined references, and
    orphan rules, returning logs for any issues found. *)
