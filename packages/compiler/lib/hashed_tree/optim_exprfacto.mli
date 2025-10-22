val compress : Tree.t -> Tree.t
(** [compress hashed_tree] computes a new evaluation tree where
		frequents common sub-expressions have been factored out into dedicated
		rules. *)
