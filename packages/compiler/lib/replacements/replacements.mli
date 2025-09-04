(** Rule replacement system for the compiler.
    This module handles the logic for rule replacements in the language,
    including detecting cycles and applying replacements to evaluation trees. *)

type t

type replace_meta

val from_resolved_ast : Shared.Shared_ast.resolved -> t Utils.Output.t
(** Build a replacement graph from the AST *)

val apply_replacements :
     replacements:t
  -> mk:'a Shared.Eval_tree.mk_value_fn
  -> 'a Shared.Eval_tree.t
  -> 'a Shared.Eval_tree.t Utils.Output.t
(** Apply replacements to a tree *)
