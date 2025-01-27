/** @packageDocumentation

## Situation migration

### Why?

In time, the `publicodes` models evolve. When a model is updated (e.g. a rule
is renamed, a value is changed, a new rule is added, etc.), we want to ensure
that the previous situations (i.e. answers to questions) are still valid.

This is where the sitation migration comes in.

### Usage

{@link migrateSituation | `migrateSituation`} allows to migrate a situation from
an old version of a model to a new version according to the provided _migration
instructions_.


```typescript
import { migrateSituation } from '@publicodes/tools/migration'

const situation = {
  "age": 25,
  "job": "developer",
  "city": "Paris"
}

const instructions = {
  keysToMigrate: {
    // The rule `age` has been renamed to `âge`.
    age: 'âge',
    // The rule `city` has been removed.
    city: ''
  },
  valuesToMigrate: {
    job: {
      // The value `developer` has been translated to `développeur`.
      developer: 'développeur'
    }
  }
}

migrateSituation(situation, instructions) // { "âge": 25, "job": "'développeur'" }
```
*/

export * from './migrateSituation'
