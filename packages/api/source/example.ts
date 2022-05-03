import cors from '@koa/cors'
import Router from '@koa/router'
import Koa from 'koa'
import Engine from 'publicodes'
import { koaMiddleware } from 'publicodes-api'

interface State extends Koa.DefaultState {}

interface Context extends Koa.DefaultContext {}

const app = new Koa<State, Context>()
const router = new Router<State, Context>()

app.use(cors())

// Create middleware
const apiRoutes = koaMiddleware(() => new Engine('coucou: 0'))

// Basic usage
router.use(apiRoutes)

// Use with specific route prefix
router.use('/v1', apiRoutes)

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3003)
