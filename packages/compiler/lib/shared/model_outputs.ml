(** Differenciate rules outputs and their parameters *)
type kind = Output | Parameter

(** Represents a model output rule with its metadata and dependencies.

    An output rule is a rule that can be evaluated and is part of the public API
    of the model. It contains:
    - [rule_name]: The name of the rule
    - [parameters]: List of parameter rules that this output depends on
    - [meta]: Metadata associated with the rule
    - [kind]: The kin of the rule (output/parameter)
    - [typ]: The type of the rule (optional) *)
type model_output =
  { rule_name: Rule_name.t
  ; parameters: Rule_name.t list
  ; meta: Shared_ast.rule_meta list
  ; kind: kind
  ; typ: Typ.t option }

(** A list of model outputs representing all the public API of a model. *)
type t = model_output list

let is_output = function Output -> true | Parameter -> false
