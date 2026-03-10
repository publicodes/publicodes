(** This modules generate Jingo models based on the hashed tree, in a lambda
  calculus way.

  The models follow this structure:

  {@yaml[
  rules:
    -
      rule_type: str
      rule_name: str
      rule_data:
        type: str
        value: ...
  outputs:
  ]}
 *)

val models : Tree.t -> Shared.Model_outputs.t -> Utils.Template.t
(** [models ~hased_tree ~outputs] converts a hashed typed tree to its
		corresponding set of Template models. *)
