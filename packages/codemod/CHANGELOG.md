# @publicodes/codemod

## 2.0.1-alpha.0

### Patch Changes

- [#888](https://github.com/publicodes/publicodes/pull/888) [`9f08310`](https://github.com/publicodes/publicodes/commit/9f08310013add34f65c0c45b26ef7bb68321cecf) Thanks [@Clemog](https://github.com/Clemog)! - Improve the v1 → v2 codemod:

    - Accept directories as command line arguments: they are walked recursively and every `.publicodes` file they contain is processed
    - Add the `-f`, `--flatten` option, which moves the files contained in the sub-directories of each given directory to its root, prefixing their name with their relative path
    - Transform `possibilités` to `enum` in rules, and remove properly double quotes from strings
    - Split the `remplace` and `rend non applicable` entries that reference several rules into one entry per rule, as `références à` only accepts a single rule in v2
    - Chain the replacements that define a `priorité`, from the lowest priority up to the highest one, since v2 no longer supports `priorité`. When the order is ambiguous, print a warning and leave the replacements unchanged
    - Remove `priorité` from `rend non applicable`, with a warning
