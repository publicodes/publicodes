open Common
open Utils

val resolve : Parser.Ast.t -> (Parser.Ast.t * Dotted_name.Set.t) Output.t
