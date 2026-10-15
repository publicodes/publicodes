(** Represents a model output rule (i.e a rule marked as public or a parameter
    of a public rule) along with its metadata and dependencies:
    - [rule_name]: The name of the rule.
    - [parameters]: List of parameter rules that this output depends on.
    - [meta]: Metadata associated with the rule.
    - [is_output]: True if the rule is a public output, false if it's a
    parameter of a public output.
    - [typ]: The type of the rule. NOTE(Emile): in witch cases can this be None?
    The type should always be inferred if not explicitly specified.
    *)
type t =
  { rule_name: Rule_name.t
  ; parameters: Rule_name.t list
  ; meta: Shared_ast.rule_meta list
  ; is_output: bool
  ; typ: Typ.t option }
