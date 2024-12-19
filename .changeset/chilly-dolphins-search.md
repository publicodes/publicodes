---
'@publicodes/react-ui': minor
'publicodes': minor
---

Improve `une possibilité` mecanism

`Une possibilité` now accepts inlined rule and constant.
For instance, you can write :

```yaml
a:
    une possibilité:
        - 3 ans
        - 4 ans
        - 5 ans
```

or

```yaml
a:
    une possibilité:
        - b:
              title: 'Option b'
        - c:
              title: 'Option c'
        - "'option d'"
```

See the [documentation](https://publi.codes/docs/manuel/une-possibilité) for more details.

The possible values are parsed and added to the rule node under the key `possibleChoices`.

Add a new strict option `checkPossibleValues` to checks if the evaluated value is in the list of possible choices and throws an error if not (default to false).

Improve type inference of rule.

---

AST BREAKING CHANGE (AST change are not in semantic versioning) :

-   Deletion of `une possibilité` ASTNode
-   `parseExpression` of number with unit returns a constant node with the unit as a property, instead of a unit node to be parses:
    ```js
    parseExpression('3 €')
    // Before : { unité: '€', constant: { nodeType: 'constant', value: 3 }
    // Now : { nodeType: 'constant', value: 3, unit: {numertor: '€' } }
    ```
