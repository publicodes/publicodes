val mk_and_checks :
     Shared.Shared_ast.resolved
  -> replacement_graph:Replacement_graph.Rule_graph.t
  -> make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Rule_graph.t Utils.Output.t
(** [mk_and_checks ast ~replacement_graph ~make_not_applicable_graph] constructs a
    dependency graph from the resolved AST and performs checks on it. It returns
    the constructed dependency graph if all checks pass, or an error if any
    check fails. *)

val extract_outputs :
     ast:Shared.Shared_ast.resolved
  -> eval_tree:Shared.Typ.t option Eval_tree.t
  -> warn_types:bool
  -> Rule_graph.t
  -> Shared.Model_output.t list Utils.Output.t
(** [extract_outputs ~ast ~eval_tree ~warn_types depenency_graph] extracts the
    public outputs of a model from its [dependency_graph].

    This function identifies all rules marked as public in the AST and computes
    their dependencies (parameters). It also adds metadata and type information
    to each output retrieved respectively from the [ast] and [eval_tree]. *)

module Rule_graph = Rule_graph
