open Common
open Utils

val to_resolved_ast :
  Parser.Ast.t -> (Rule_name.t option Shared_ast.t * Rule_name.Set.t) Output.t
