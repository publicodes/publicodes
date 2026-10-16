---
'@publicodes/codemod': patch
---

- Accept directories as command line arguments: they are walked recursively and every `.publicodes` file they contain is processed
- Transform `possibilités` to `enum` in rules, and remove properly double quotes from strings
