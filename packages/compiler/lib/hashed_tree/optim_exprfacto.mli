(**
	 NOTE: the initial experiments are not very conclusive, indeed, the
	 performance doesn't seem to have improved. This could be due to the fact that
	 factorized expressions are compiled as regular Publicodes rules and
	 therefore, the overhead due to the cache system isn't worth it.
	 TODO: we can try to factorize the sub-expressions into dedicated functions
	 that will perform memoization on their own and avoid relying on the [$ref]
	 runtime.	*)

val compress : Tree.t -> Tree.t
(**	[compress hashed_tree] computes a new evaluation tree where
		frequents common sub-expressions have been factored out into dedicated
		rules. *)
