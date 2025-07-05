# @publicodes/forms

## 0.6.0

### Minor Changes

- [#673](https://github.com/publicodes/publicodes/pull/673) [`8ce4b59`](https://github.com/publicodes/publicodes/commit/8ce4b596d8530c5bcee65e426e3d001a8d346309) Thanks [@Clemog](https://github.com/Clemog)! - - type of `element.id` is now RuleName
    - show better error message for missing flag
    - add options possibilty for formBuilder. First one is `selectTreshold` which allows to set a threshold to define when a select should be displayed instead of radio buttons for `possibilités`.
    - add `title` optionnal property to `PageBuilder` to define title for each page of multi-page forms.

## 0.5.1

### Patch Changes

- [#660](https://github.com/publicodes/publicodes/pull/660) [`91cd564`](https://github.com/publicodes/publicodes/commit/91cd564c70e63f65d2733e45415d1780f8b3926e) Thanks [@johangirod](https://github.com/johangirod)! - Add "evaluate" method to FormBuilder (for enabling reactivity of evaluation in signal-based reactivity framework)

## 0.5.0

### Minor Changes

- [#652](https://github.com/publicodes/publicodes/pull/652) [`7eff8a1`](https://github.com/publicodes/publicodes/commit/7eff8a17addb155749bc3e9b49f74885d35577c9) Thanks [@johangirod](https://github.com/johangirod)! - A new rule key `form` is specified for metadata used in `@publicodes/forms`. This will take the place of the `saisie` key.

    - BREAKING: the `saisie` key is now under the `form` key
    - BREAKING: the `orientation` key is now under the `form` key for
      possibilities
    - It is possible to customize label and description of the input with
      the `label` and `description` keys
    - It is possible to customize the order of questions in form with the
      `position` key

## 0.4.0

### Minor Changes

- [#650](https://github.com/publicodes/publicodes/pull/650) [`daed2e0`](https://github.com/publicodes/publicodes/commit/daed2e0be7f9e8df69ca30d2f7364ebd6379012f) Thanks [@johangirod](https://github.com/johangirod)! - Change form builder API to a class-based API.

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
