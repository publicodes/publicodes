# @publicodes/cli

## 2.0.0-alpha.6

### Patch Changes

- [#902](https://github.com/publicodes/publicodes/pull/902) [`9caa804`](https://github.com/publicodes/publicodes/commit/9caa8047352985598348b2e192aaba1e7ad6d6f7) Thanks [@EmileRolley](https://github.com/EmileRolley)! - Fix - a `not defined` value now propagates through a negation instead of throwing, a list mechanism keeps the order of its members, and a month-only date keeps its year.

    `publicodes compile -t json` replaces `-t json_doc`: the document is built from the typed AST, and now carries the inferred types and each rule's dependency graph (`referenced_by`, `parameters`).

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
