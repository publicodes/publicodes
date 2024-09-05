---
'@publicodes/react-ui': patch
---

Improve significative digit handling

Improve the logic for the number of significative digits displayed in the documentation page :

- Use the number of digits specified in `arrondi` mecanism if it exists
- If the value is a constant, use the number of digits in the constant
