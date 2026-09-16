open Shared

module Hash : sig
  type t = string [@@deriving equal, compare, show, sexp]

  val hash : t -> int

  val combine : t list -> t

  val of_string : string -> t

  val of_float : float -> t

  val of_bool : bool -> t

  val of_constant : Eval_tree.constant -> t

  val of_binary_op : Eval_tree.binary_op -> t

  val of_unary_op : Eval_tree.unary_op -> t

  val of_rounding : Shared_ast.rounding -> t

  val of_rule_name : Rule_name.t -> t
end

type hash_and_type = {typ: Typ.t option; hash: Hash.t}

type t = hash_and_type Eval_tree.t

type value = hash_and_type Eval_tree.value
