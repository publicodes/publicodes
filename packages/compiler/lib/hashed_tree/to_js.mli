val to_js :
  eval_tree:Tree.t -> outputs:Shared.Model_outputs.t -> string * string
(** [to_js tree params] converts a typed tree to a JavaScript representation.
		It returns a tuple containing the JavaScript code as a string (index.js) and the
		associated type information as another string (index.d.ts). *)
