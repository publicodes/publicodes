module type RuleGraph = sig
  include Graph.Sig.G

  val reference : E.t -> Shared.Rule_name.t * Utils.Pos.t
  (** [reference e] returns the rule name its position from a graph edge [e]. *)
end

(** Functor to create a cycle detection module for a given rule graph.

    @example
    {[
      module Cycle_analysis = Cycles.Make (struct
        include Rule_graph

        let reference ((_, pos, (rule, _)) : Rule_graph.edge) = (rule, pos)
      end)

      let _ = Cycle_analysis.check graph
    ]}
 *)
module Make : (G : RuleGraph) -> sig
  val check : ?error:Utils.Err.Code.t * string -> G.t -> Utils.Log.t Base.list
  (** [check graph] checks for cycles in the given [graph] and returns a list of
      logs for each cycle detected.

      The [error] parameter allows to specify the error code and message to be
      used for the logs. *)
end
