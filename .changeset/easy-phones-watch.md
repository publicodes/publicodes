---
'@publicodes/forms': minor
---

A new rule key `form` is specified for metadata used in `@publicodes/forms`. This will take the place of the `saisie` key.

- BREAKING: the `saisie` key is now under the `form` key
- BREAKING: the `orientation` key is now under the `form` key for
  possibilities
- It is possible to customize label and description of the input with
  the `label` and `description` keys
- It is possible to customize the order of questions in form with the
  `position` key
