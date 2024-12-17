---
'publicodes': minor
---

Add option to detect cycles at runtime and improve type inference

The strict option `noCycleRuntime` can be set to detect cycles at
runtime. When a cycle is detected, the engine will throw an error
(disabled by default).

Reactivate runtime warning for cycles in the engine.

Improved type inference for rules, adding the possibility to enforce
the type of rule with the `type` key.
