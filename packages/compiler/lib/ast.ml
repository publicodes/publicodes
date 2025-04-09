type expr = string [@@deriving show]
type rule_value = Expr of expr | Undefined [@@deriving show]
type rule_def = { name : string; value : rule_value } [@@deriving show]
type program = rule_def list [@@deriving show]
