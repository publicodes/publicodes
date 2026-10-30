---
"@publicodes/autodoc-core": minor
"@publicodes/cli": patch
---

The JSON AST now carries replacements: each rule lists the `replaces` / `makes_not_applicable` clauses its author wrote, and every `ref` node carries the `replaced_by` / `made_not_applicable_by` tree resolved for its site. `publicodes compile -t json` emits them, and `@publicodes/autodoc-core` types them.
