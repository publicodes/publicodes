# @publicodes/forms

## 0.3.1

### Patch Changes

- [#643](https://github.com/publicodes/publicodes/pull/643) [`a8cdf32`](https://github.com/publicodes/publicodes/commit/a8cdf327be12fabd85abc36db2a8955cc3c60a30) Thanks [@johangirod](https://github.com/johangirod)! - Fix `getEvaluatedFormElement` for boolean rules with questions

## 0.3.0

### Minor Changes

- [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d) - Change typescript exports to prevent performance issues

- [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d) - Change form state manipulation function signature

    Instead of mixing named parameters and classic parameters, we now use a single object parameter. This makes the function easier to use and understand.

    ```diff
    - function currentPage(formState, { engine }) {
    + function currentPage({ formState, engine }) {
    ```

## 0.2.0

### Minor Changes

- [#604](https://github.com/publicodes/publicodes/pull/604) [`2b6aa7a`](https://github.com/publicodes/publicodes/commit/2b6aa7a1151cb6e8295b1ca017dcf4fb47a8b38d) Thanks [@johangirod](https://github.com/johangirod)! - Add a utilities for generating forms from publicodes rules

### Patch Changes

- [#617](https://github.com/publicodes/publicodes/pull/617) [`bf896a5`](https://github.com/publicodes/publicodes/commit/bf896a59f73bcfc2eda1b01def7535ff5ed969d5) Thanks [@johangirod](https://github.com/johangirod)! - Fix bug with buildFormPage
