## `@publicodes/api`

This package allows you to create a REST API, which follows OpenAPI 3.0 specifications, from your Publicodes rules.

It consists of [Koa](https://github.com/koajs/koa) middleware that adds routes to your router:

-   `POST` `/evaluate` Evaluate one or more expressions with a given situation
-   `GET` `/rules` Returns the list of all your rules
-   `GET` `/rules/{rule}` Returns a specific rule

## Installation

```bash
npm install @publicodes/api
```

## Utilisation

```ts
import Router from '@koa/router'
import Koa from 'koa'
import Engine from 'publicodes'
import { koaMiddleware as publicodesAPI } from '@publicodes/api'

const app = new Koa()
const router = new Router()

// Create middleware with your Engine
const apiRoutes = publicodesAPI(new Engine('coucou: 0'))

// Basic routes usage (/evaluate, /rules, etc.)
router.use(apiRoutes)

// Or use with specific route prefix (/v1/evaluate, /v1/rules, etc.)
router.use('/v1', apiRoutes)

app.use(router.routes()).listen(3000)

// ...
```

A complete example file is in the sources if needed : [example.ts](https://github.com/publicodes/publicodes/blob/master/packages/rest-api/example.ts).

## Documentation

-   [Publicodes API](https://publi.codes/docs/api/api-rest/)
-   [Publicodes](https://publi.codes/)

## Projets phares

-   **[mycompanyinfrance API](https://mycompanyinfrance.urssaf.fr/developer/api)**
