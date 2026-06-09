val mk_and_checks : Shared.Shared_ast.resolved -> Rule_graph.t Utils.Output.t
(** [mk_and_checks ~ast ~eval_tree] creates a dependency graph from the given
    resolved [ast] and performs verifications on it, such as cycle detection and
    valid access checks. It returns the updated dependency graph along with any
    logs generated during the checks. *)

val extract_outputs :
     ast:Shared.Shared_ast.resolved
  -> eval_tree:Hashed_tree.t
  -> warn_types:bool
  -> Rule_graph.t
  -> Shared.Model_output.t list Utils.Output.t
(** [extract_outputs ~ast ~eval_tree ~warn_types depenency_graph] extracts the
    public outputs of a model from its [dependency_graph].

    This function identifies all rules marked as public in the AST and computes
    their dependencies (parameters). It also adds metadata and type information
    to each output retrieved respectively from the [ast] and [eval_tree]. *)

module Rule_graph = Rule_graph
