# @publicodes/forms

## 0.3.0

### Minor Changes

- [#636](https://github.com/publicodes/publicodes/pull/636) [`eb2f607`](https://github.com/publicodes/publicodes/commit/eb2f607ccf41528561192bf01e192a19e626bc50) Thanks [@johangirod](https://github.com/johangirod)! - Change typescript exports to prevent performance issues

- [#633](https://github.com/publicodes/publicodes/pull/633) [`11eef79`](https://github.com/publicodes/publicodes/commit/11eef798f6bea6670591fa3b93a9bc79c8aa63da) Thanks [@johangirod](https://github.com/johangirod)! - Change form state manipulation function signature

    Instead of mixing named parameters and classic parameters, we now use a single object parameter. This makes the function easier to use and understand.

    ```diff
    - function currentPage(formState, { engine }) {
    + function setFormValue({ formState, engine }) {
    ```

## 0.2.0

### Minor Changes

- [#604](https://github.com/publicodes/publicodes/pull/604) [`2b6aa7a`](https://github.com/publicodes/publicodes/commit/2b6aa7a1151cb6e8295b1ca017dcf4fb47a8b38d) Thanks [@johangirod](https://github.com/johangirod)! - Add a utilities for generating forms from publicodes rules

### Patch Changes

- [#617](https://github.com/publicodes/publicodes/pull/617) [`bf896a5`](https://github.com/publicodes/publicodes/commit/bf896a59f73bcfc2eda1b01def7535ff5ed969d5) Thanks [@johangirod](https://github.com/johangirod)! - Fix bug with buildFormPage
