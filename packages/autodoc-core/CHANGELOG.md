# @publicodes/autodoc-core

## 0.1.0-alpha.0

### Minor Changes

- [#918](https://github.com/publicodes/publicodes/pull/918) [`8027034`](https://github.com/publicodes/publicodes/commit/8027034c28344037fcc6ed7e2e0bf4f0230c16be) Thanks [@johangirod](https://github.com/johangirod)! - Rank the terms of a sum from the biggest down. Without an evaluation there is nothing to rank by, and the author's order stands.

- [#918](https://github.com/publicodes/publicodes/pull/918) [`8027034`](https://github.com/publicodes/publicodes/commit/8027034c28344037fcc6ed7e2e0bf4f0230c16be) Thanks [@johangirod](https://github.com/johangirod)! - A rule whose value is written as a literal no longer offers an empty sheet: the line shows its figure and opens nothing. `EquationView.note` is removed.

- [#918](https://github.com/publicodes/publicodes/pull/918) [`63c3e8b`](https://github.com/publicodes/publicodes/commit/63c3e8b6ec7c88ce994db1ff7c689e0e6cae609a) Thanks [@johangirod](https://github.com/johangirod)! - Introduce `@publicodes/autodoc-core` and `@publicodes/autodoc-react`: the documentation of a model computation, built from its compiled output and the trace of the evaluation.

### Patch Changes

- [#918](https://github.com/publicodes/publicodes/pull/918) [`8027034`](https://github.com/publicodes/publicodes/commit/8027034c28344037fcc6ed7e2e0bf4f0230c16be) Thanks [@johangirod](https://github.com/johangirod)! - Improved performance: a 300-rule model goes from 754 ms to 1,2 ms per page.
