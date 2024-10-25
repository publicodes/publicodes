## Getting started

```bash
npm install publicodes
```

The library exports a default class [`Engine`](https://publi.codes/docs/api/publicodes/classes/engine) which allows you to instantiate an publicodes interpreter with a set of publicodes rules.

```js
import Engine from 'publicodes'
import { parse as parseYaml } from 'yaml'

// We define a list of publicodes rules
const rules = `
dépenses primeur:
  somme:
    - 1.5 kg * 2€/kg    # carottes
    - 500g * 6€/kg      # champignons
    - 3 avocats * 1.5€/avocats
`
const parsedRules = parseYaml(rules)
const engine = new Engine(parsedRules)

const result = engine.evaluate('dépenses primeur')
```

[👉 Continue to the « Getting started » section](https://publi.codes/docs/tutoriel)
