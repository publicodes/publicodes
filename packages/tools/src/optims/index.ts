/** @packageDocumentation

## The constant folding pass

Currently, only one optimisation pass is available: the constant folding one.

Constant folding consists in calculating at compile time the value of an
expression and replacing them in all its references. After this step, if a rule
is no longer used by any other rules, it's deleted -- unless the `toKeep`
attribute is provided.

### Why?

Publicodes based projects are built [_by
design_](https://publi.codes/docs/pourquoi-publicodes/standard-modeles-ouverts#document%C3%A9s-sourc%C3%A9s)
to be fully transparent and intelligible for the most people. This means to be
open-source, but especially to be as detailed as possible in the calculation.

Consequently, a severe complexity of the models start to appears. However, this complexity
is only justified for the documentation not for the computation/simulation it self.

For example, considering the following rule
[`alimentation . déchets . niveau
moyen`](https://github.com/incubateur-ademe/nosgestesclimat/blob/959bfd4f66a18ffb37e38976d57e04dddd4d2b58/data/alimentation/mod%C3%A8le%20d%C3%A9chets/alimentation%20.%20d%C3%A9chets.publicodes#L74-L82):

```yaml
alimentation . déchets . niveau moyen:
  formule:
    somme:
      - omr
      - collecte separee
      - dechetterie
      - gestes
  description: |
    Ce niveau correspond à la moyenne française.
```

could be optimized in:

```yaml
alimentation . déchets . niveau moyen:
  formule:
    somme:
      - 96.0151712
      - 48.512508999999994
      - 49.9611611
      - gestes
  description: |
    Ce niveau correspond à la moyenne française.
```

This rule allows to compute the average level of food waste produced by a
French person. This value doesn't depend on any user inputs: it's the same for
every simulation. Therefore, it's possible to compute the value
at compile time and to simplify the model used by the browser.


### Usage

```typescript
import Engine from 'publicodes'
import { constantFolding } from '@publicodes/tools'

const optimizedRules = constantFolding(
  // A publicode engine instantiated with the rules to optimize.
  new Engine(baseRules),
  // A predicate returning true if the rule needs to be kept.
  ([ruleName, ruleNode]) => {
    return ['root', 'root . bis'].includes(ruleName) ||  ruleNode.rawNode['to keep']
  }
)
```
 */

export * from './constantFolding'
