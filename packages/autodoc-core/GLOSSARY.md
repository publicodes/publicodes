# Autodoc

The vocabulary of the autodoc: rendering a Publicodes rule's computation and the
path its evaluation actually took, for a reader who has been shown a number and
wants to know where it came from. Shared by `autodoc-core` and `autodoc-react`;
the concepts belong to the domain, not to either package.

## Language

**Autodoc**:
The generated documentation of a rule's computation. Not the model's prose, and
not the reference documentation of the Publicodes language.
_Avoid_: rule page, doc generator

**Rule**:
A named quantity in a Publicodes model, identified by a dotted name.
_Avoid_: parameter, variable, field

**Mechanism**:
An operation a rule's definition is built from — a sum, a condition, a rounding.
The units of which a computation is composed.
_Avoid_: operator, node type, function

**Parameter**:
A rule with no computation of its own, whose value the context supplies. Its
role in the documentation is to be recognised as the reader's own input.
_Avoid_: supplied rule, situation variable, leaf, input rule

**Output**:
A rule the model author marked public, and so part of the model's declared API.
Renaming one is a breaking change; renaming anything else is not.
_Avoid_: public rule, export, result

**Context**:
The values a rule is evaluated against. Supplied by the reader at the root of an
evaluation, and overridden by `avec le contexte` as evaluation descends.
_Avoid_: situation, state, environment, inputs

**Context stack**:
The chain of context overrides in force at one point in an evaluation. The same
mechanism can be evaluated under more than one. Never shortened to "context".
_Avoid_: scope, context

**Evaluation trace**:
The record of which mechanisms were evaluated to produce a value, and what each
returned. It contains the mechanisms that ran and no others, so absence from the
trace means a mechanism did not run.
_Avoid_: log, execution record

**Applied branch**:
Within a conditional, the branch the evaluation actually took. Identified by its
presence in the evaluation trace, never inferred from the condition's value.
_Avoid_: taken branch, selected case, active variation

**Not defined**:
No value could be determined — the context supplies nothing and nothing computes
one. The normal state of a parameter nobody has answered, not an error.
_Avoid_: undefined, null, empty, missing

**Not applicable**:
The rule does not apply in this context, which is itself a definite answer.
Distinct from not defined: nothing is missing.
_Avoid_: N/A, disabled, inactive

**Path navigation**:
Moving the reader to a rule's own page, changing the URL. Available only for
rules in the model's declared API.
_Avoid_: link navigation, routing, site navigation

**Block**:
A separately exported part of a rule's page, rendering on its own from what the rule carries.
The page is an arrangement of blocks, which a host rebuilds or extends.
_Avoid_: section, widget, panel, fragment

**Button navigation**:
Expanding a referenced rule in place, leaving the URL and the reader's place
untouched. How rules outside the declared API are still reached.
_Avoid_: inline navigation, disclosure, expand
