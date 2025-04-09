open Utils

(* TODO: reimplement the expression parser and handle localisation *)
let parse str =
  Loc.make_with ~filename:"test" ~col:0 ~row:0 (Ast.Const (String str))
