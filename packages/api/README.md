## Publicodes API

Ce package vous permet de créer une API REST, qui suit les spécifications OpenAPI 3.0, à partir de vos règles Publicodes.

Il consiste en un middleware [Koa](https://github.com/koajs/koa) qui ajoute des routes à votre router :

-   `POST` `/evaluate` Évalue une ou plusieurs expressions avec une situation donnée
-   `GET` `/rules` Retourne la liste de toutes vos règles
-   `GET` `/rules/{rule}` Retourne une règle spécifique

## Installation

```sh
npm install publicodes-api
# or
yarn add publicodes-api
```

## Utilisation

```ts
import Router from '@koa/router'
import Koa from 'koa'
import Engine from 'publicodes'
import { koaMiddleware as publicodesAPI } from 'publicodes-api'

const app = new Koa()
const router = new Router()

// Create middleware with your Engine
const apiRoutes = publicodesAPI(() => new Engine('coucou: 0'))

// Basic routes usage (/evaluate, /rules, etc.)
router.use(apiRoutes)

// Or use with specific route prefix (/v1/evaluate, /v1/rules, etc.)
router.use('/v1', apiRoutes)

app.use(router.routes()).listen(3000)

// ...
```

Un fichier d'exemple complet se trouve dans les sources si besoin : [example.ts](https://github.com/betagouv/publicodes/blob/master/packages/api/example.ts).

## Documentation

-   ...

## Projets phares

-   **[l'api mon-entreprise.fr](https://mon-entreprise.urssaf.fr/api)** ...
