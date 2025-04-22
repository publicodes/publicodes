type rule_value = Expr of Expressions.Ast.t | Undefined [@@deriving show]

type rule_def = {
  name :
    (* FIXME: should be [dotted_name]. The one from [Expressions.Ast] should be
		 moved into a shared Ast module *)
    string list;
  value : rule_value;
}
[@@deriving show]

type program = rule_def list [@@deriving show]
