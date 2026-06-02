type model_output =
  { rule_name: Rule_name.t
  ; parameters: Rule_name.t list
  ; meta: Shared_ast.rule_meta list
  ; is_output: bool
  ; typ: Typ.t option }

type t = model_output list
