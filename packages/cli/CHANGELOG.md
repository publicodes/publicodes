# @publicodes/cli

## 2.0.0-alpha.6

### Patch Changes

- [#902](https://github.com/publicodes/publicodes/pull/902) [`9caa804`](https://github.com/publicodes/publicodes/commit/9caa8047352985598348b2e192aaba1e7ad6d6f7) Thanks [@EmileRolley](https://github.com/EmileRolley)! - Fix - a `not defined` value now propagates through a negation instead of throwing, a list mechanism keeps the order of its members, and a month-only date keeps its year.

    `publicodes compile -t json` replaces `-t json_doc`: the document is built from the typed AST, and now carries the inferred types and each rule's dependency graph (`referenced_by`, `parameters`).

- [`5da0b32`](https://github.com/publicodes/publicodes/commit/5da0b325a171c262a2f313e2035b97b282e00603) Thanks [@stacyharper](https://github.com/stacyharper)! - Implement "applicabilité étendue"

- [#926](https://github.com/publicodes/publicodes/pull/926) [`c4ee9eb`](https://github.com/publicodes/publicodes/commit/c4ee9eb2e242cb595cd7a536fa1ea8731b6209d2) Thanks [@stacyharper](https://github.com/stacyharper)! - fix duplicate cycle errors because of different contexts

- [`af978f0`](https://github.com/publicodes/publicodes/commit/af978f0895c784520447a8776ab32ec90248a957) Thanks [@stacyharper](https://github.com/stacyharper)! - Rename "rend la branche applicable"

- [`9bc2001`](https://github.com/publicodes/publicodes/commit/9bc20016aca417e14148aa3f6d6d3218e3a81af2) Thanks [@stacyharper](https://github.com/stacyharper)! - Make "applicabilité etendue" consistent with other "rends non applicable".

- [`d7f2c58`](https://github.com/publicodes/publicodes/commit/d7f2c58c4ae0a0be11a398c57d6132681f121fa9) Thanks [@stacyharper](https://github.com/stacyharper)! - Implement "abattement"

- [#922](https://github.com/publicodes/publicodes/pull/922) [`1a9481d`](https://github.com/publicodes/publicodes/commit/1a9481d7414c4e445dfa6fe4289e1d158ac633d8) Thanks [@johangirod](https://github.com/johangirod)! - The JSON AST now carries replacements: each rule lists the `replaces` / `makes_not_applicable` clauses its author wrote, and a `ref`'s `parameters` names the rule it reads with the `replaced_by` / `made_not_applicable_by` tree resolved for its site. `publicodes compile -t json` emits them, and `@publicodes/autodoc-core` types them.

- [`d3f7bfd`](https://github.com/publicodes/publicodes/commit/d3f7bfdb5b7daf1affda62c9a1f172711e008c35) Thanks [@stacyharper](https://github.com/stacyharper)! - Detect replacement cycles between "remplace" and "rends non applicable"

- [#926](https://github.com/publicodes/publicodes/pull/926) [`adb0d08`](https://github.com/publicodes/publicodes/commit/adb0d088317adf1a9d73816921b555fae33ba149) Thanks [@stacyharper](https://github.com/stacyharper)! - Implement "inversion numérique"

## 2.0.0-alpha.5

### Patch Changes

- [#904](https://github.com/publicodes/publicodes/pull/904) [`08cf638`](https://github.com/publicodes/publicodes/commit/08cf638779ee96121d8b70efdbee1e88d219cdaa) Thanks [@EmileRolley](https://github.com/EmileRolley)! - Fix - use default values for mechanisms with empty list (`une de ces conditions` and `toutes ces conditions`)

- [#904](https://github.com/publicodes/publicodes/pull/904) [`1b6f671`](https://github.com/publicodes/publicodes/commit/1b6f67119137bed78851290dc6821eef807f7fab) Thanks [@EmileRolley](https://github.com/EmileRolley)! - Fix - correctly handle percentage in the `produit` mechanism

- [`6fac2e0`](https://github.com/publicodes/publicodes/commit/6fac2e0850053e30e524d97f5fb65bc134416c89) Thanks [@EmileRolley](https://github.com/EmileRolley)! - Avoid duplicated evaluations of exclusive replacements in the JS runtime.

## 2.0.0-alpha.4

### Patch Changes

- [#900](https://github.com/publicodes/publicodes/pull/900) [`ffb274c`](https://github.com/publicodes/publicodes/commit/ffb274c1b83ed0f16962cd2428f8076f8b8cc04b) Thanks [@stacyharper](https://github.com/stacyharper)! - Triggers a rebuild

## 2.0.0-alpha.3

### Patch Changes

- [#897](https://github.com/publicodes/publicodes/pull/897) [`138af03`](https://github.com/publicodes/publicodes/commit/138af0395f7d2b379b149e3745da428d0bdefa98) Thanks [@stacyharper](https://github.com/stacyharper)! - Fix the --version argument

## 2.0.0-alpha.2

### Patch Changes

- [`0ca7986`](https://github.com/publicodes/publicodes/commit/0ca79868fd888252d39d9cb9a56a05b72f2bc5aa) Thanks [@stacyharper](https://github.com/stacyharper)! - Add READMEs for sub clients packages

## 2.0.0-alpha.1

### Patch Changes

- [`f098078`](https://github.com/publicodes/publicodes/commit/f098078c709085d0d58da6ee1f15dc3104b65b94) Thanks [@stacyharper](https://github.com/stacyharper)! - Rebuild using CI
