open Shared

(** This module encapsulates [contexte] mechanisms represented as the set of the
   rules defined in the context and a unique identifier for the context. Indeed,
   a rule can define multiple contexts with nested mechanisms, so the rule name
   alone is not enough to identify a context.

   The unique identifier is generated based on the rule name and the position of
   the [contexte] mechanism in the source code. *)

type t [@@deriving equal, compare]

val mk : Rule_name.t -> Rule_name.t Utils.Mark.pos list -> Utils.Pos.t -> t
(** [mk current_rule rules pos] creates a new context with a unique identifier
    based on the [current_rule] and its position [pos], along with a list of
    [rules] that are defined in the context. *)

val id : t -> Id.t
(** [id ctx] returns the unique identifier of the context [ctx]. *)

val rules : t -> Rule_name.t Utils.Mark.pos list
(** [rules ctx] returns the list of rules defined in the context [ctx], along
    with their positions. *)

val rules_without_pos : t -> Rule_name.t list
(** [rules_without_pos ctx] returns the list of rule names in the context [ctx]
    without their positions. *)

val equal : t -> t -> bool
(** [equal ctx1 ctx2] checks if two contexts are equal based on their unique
    identifiers. *)

val contains : Rule_name.t -> t -> bool
(** [contains rule_name ctx] checks if the context [ctx] contains the rule
    [rule_name]. *)

val to_string : t -> string
(** [to_string ctx] converts the context [ctx] to a string representation. *)

val from_rule_def : Shared_ast.resolved_rule_def -> t list
(** [from_rule_def rule_def] collects all contexts defined in a given
    [rule_def]. *)
