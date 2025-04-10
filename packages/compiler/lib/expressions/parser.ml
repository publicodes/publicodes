open Utils

(* TODO: reimplement the expression parser and handle localisation *)
let parse str =
  Loc.make_with ~filename:"test" ~starts:(0, 0) (Ast.Const (String str))

(* let lex str =
  let tokens = Str.split (Str.regexp "[ \t\n]+") str in
  List.map
    (fun token -> (token, Loc.make_with ~filename:"test" ~col:0 ~row:0 ()))
    tokens *)
