(**  Rule Dependency Graph *)

(** This module defines a directed graph for representing rule dependencies.

  {1 Definition}

  The graph is defined as follows:

  1. Each rule defined in the model is represented as a tuple of it's
  corresponding {!Rule_name.t} and an empty context stack. This is the root
  vertex of the rule. For example, the rule [foo] is represented as [(foo, [])].

  2. An edge is created from a [('a', C_a)] to [('b', C_b)] if either:
    - the rule [b] is referenced in chainable mechanisms of the rule [a], or,
    - [a] is not referenced in any of [C_a] and [b] is referenced in the
    value of [a].

  The edge is labeled with the position of the reference in the source code.

  Encoding the context stack in the graph allows us to distinguish between a
  rule evaluated in different contexts, which facilitates some verifications
  (see {!Checks}):
    - the identification of unused contexts (i.e. rule that are referenced in
      two differents nested contexts, but only referenced in the deepest rule),
    - to allow cycle between rules if they are accessed in different contexts.

  {1 Example}

  Considering the following Publicodes model:
  {[
    rule a:
      valeur: rule b
      contexte:
        rule b: 10

    rule b:
      applicable si: rule c
      valeur: rule d

    rule c:
    rule d:
  ]}

  [rule b] and [rule d] are not considered dependencies of [rule a], because
  they are overridden in the evaluation context of [rule a]. However, chainable
  mechanisms like [applicable si] are still evaluated in the context of [rule
  a], so we need to consider [rule c] as a dependency of [rule a].

  The resulting graph is as follows:
  {[
    ("rule a", []) -> ("rule c", [(#0, { "rule b" })]),
    ("rule b", []) -> ("rule d", []),
    ("rule b", []) -> ("rule c", [])
  ]}

  [#0] is the unique identifier of the context.

  {1 Analysis of the graph}

  {2 Cycle detection}

  Once the graph is constructed, we have cycle detection for free with the
  provided {!Graph.Cycles.Johnson} module.

  {2 Unused context detection}

  As we track the context stack for each accessed rule, we can detect
  unused contexts (i.e. contexts that are overridden by a deeper context before
  being used). For example, in the following model:
  {[
    a:
      valeur: b
      contexte:
        c: 1 # this context is never used
    b:
      valeur: c
      contexte:
        c: 2
    c:
  ]}

  The definition of [c] in the context of [a] is never used, because [b]
  overrides it before it is accessed.

  The corresponding graph is as follows:
  {[
    ("a", []) -> ("b", [(#0, { "c" })]) -> ("c", [(#0, { "c" }), (#1, { "c" })])
    ("b", []) -> ("c", [(#1, { "c" })])
    ("c", [])
  ]}

  To be considered used, a rule [r] defined in a context [c_a] of a rule [a]
  must satisfy the following conditions: there is at least a path from [(a, [])]
  to [(r, C)] in the graph) (i.e. [r] is a dependency of [a]) where [c_a] is the
  latest context in [C] containing [r].

  If there is a path from [(a, [])] to [(r, C)] where [c_a] is not the latest
  context in [C] containing [r], this means that [r] is overriden by a deeper
  context before being used.

  This in the example, for the context [#0] of [a], there is two nodes where [c]
  is referenced:
    - [("c", [(#0, { "c" }), (#1, { "c" })])]
    - [("c", [(#1, { "c" })])].
  However, for both of them, the latest context containing [c] is [#1], which
  means that the context [#0] is never used.

  *)

open Shared

(** {1 Graph construction} *)

module Rule_vertex : sig
  type t = Rule_name.t * Rule_context.t list [@@deriving equal, compare]

  val hash : t -> int
end

module Ref_edge : sig
  type t = Utils.Pos.pos [@@deriving compare]

  val hash : t -> int

  val default : t
end

include
  Graph.Sig.I
    with type V.t = Rule_vertex.t
     and type V.label = Rule_vertex.t
     and type E.t = Rule_vertex.t * Ref_edge.t * Rule_vertex.t
     and type E.label = Ref_edge.t

module Oper : sig
  include Graph.Oper.S with type g = t
end

val mk : Shared_ast.resolved -> t
(** [mk ast] creates a dependency graph from the given resolved [ast].

    The graph is constructed based on the rules defined in the AST, where each
    rule is represented as a vertex in the graph. Edges are created between
    rules based on their dependencies, as described in the module documentation.
*)

val root_vertex : Rule_name.t -> Rule_vertex.t
(** [root_vertex rule_name] returns the root vertex of the given [rule_name],
    which is represented as a tuple of the rule name with an empty context
    stack. *)

(** {1 Graph utils} *)

val output_dot : ?file_path:string -> t -> unit
(** [output_dot ~file_path graph] outputs the given dependency [graph] to a DOT
    file at the specified [file_path], which can be used for debugging. *)
