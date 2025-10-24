val to_js : hashed_tree:Tree.t -> outputs:Shared.Model_outputs.t -> string
(** [to_js ~hased_tree ~outputs] converts a hashed typed tree to its
		corresponding set of javascript functions with an inlined Publicodes
		runtime. *)
