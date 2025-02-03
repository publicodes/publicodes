---
'@publicodes/react-ui': minor
'publicodes': minor
---

Improved `une possibilité` mecanism

### Une possibilité improvements

`Une possibilité` now accepts inlined rule and constant.
For instance, you can write :

```yaml
a:
    une possibilité:
        - 6 mois
        - 12 mois
        - 2 ans
```

or

```yaml
a:
    une possibilité:
        - b:
              titre: 'Option b'
        - c:
              non applicable si: x
```

See the [documentation](https://publi.codes/docs/manuel/une-possibilité) for more details.

The possible values are parsed and added to the rule node under the key `possibleChoices`.

Add a new strict option `checkPossibleValues` to checks if the evaluated value is in the list of possible choices and throws an error if not (default to false).

### Other changes

-   Improve type inference of rule.
-   Slight performance improvement (+5% on the publicodes benchmark)

-   🚨 AST BREAKING CHANGE (AST change are not in semantic versioning) :
    `parseExpression` of number with unit returns a constant node with the unit as a `rawUnit` property, instead of a unit node to be parsed:
    ```js
    parseExpression('3 €')
    // Before : { unité: '€', constant: { nodeType: 'constant', value: 3 }
    // Now : { nodeType: 'constant', value: 3, rawUnit: '€' }
    ```
