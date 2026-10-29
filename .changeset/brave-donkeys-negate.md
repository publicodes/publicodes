---
"@publicodes/cli": patch
---

Fix - a `not defined` value now propagates through a negation instead of throwing a `TypeError`, Fix - a list mechanism keeps the order of its members

`publicodes compile -t json` replaces `-t json_doc`: the document is built from the typed AST, and now carries the inferred types and each rule's dependency graph (`referenced_by`, `parameters`).
