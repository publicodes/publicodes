(**  Rule Dependency Graph *)

(** This module defines a directed graph for representing rule dependencies.

  In order to allow for context erasure, we need to store the {!Rule_context} stack of
  each rule in the graph.

  {1 Definition}

  The graph is defined as follows:

  1. Each rule defined in the model is represented as a tuple of it's
  corresponding {!Rule_name.t} and an empty context stack. This is the root
  vertex of the rule. For example, the rule `foo` is represented as `(foo, [])`.

  2. An edge is created from a `('a', ctxs_a)` to `('b', ctxs_b)` if the
  following conditions are met:
    - the rule `b` is referenced in chainable mechanisms of the rule `a`, or,
    - `a` is not referenced in any of `ctxs_a` and `b` is referenced in the
    value of the rule `a`.

  Encoding the context stack in the graph allows to distinguish between a rule
  accessed in different contexts, which facilitates some verifications (see
  {!Checks}):
    - the identification of unused contexts (i.e. rule that are referenced in
    two differents nested contexts, but only referenced in the deepest one), and
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

  We don't want to consider `rule b` or `rule d` as dependencies of `rule a`,
  because they are overridden in the evaluation context of `rule a`. However,
  chainable mechanisms like `applicable si` are still evaluated in the context
  of `rule a`, so we need to consider `rule c` as a dependency of `rule a`.

  The resulting graph is as follows:
  {[
    ("rule a", []) -> ("rule c", [(#id1, { "rule b" })]),
    ("rule b", []) -> ("rule d", []),
    ("rule b", []) -> ("rule c", [])
  ]}

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
