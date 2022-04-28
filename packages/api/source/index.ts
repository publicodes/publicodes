import cors from '@koa/cors'
import Router from '@koa/router'
import Koa from 'koa'
import Engine from 'publicodes'
import publicodesAPI from './koa-middleware'

interface State extends Koa.DefaultState {}

interface Context extends Koa.DefaultContext {}

const app = new Koa<State, Context>()
const router = new Router<State, Context>()

app.use(cors())

// Create middleware
const apiRoutes = publicodesAPI(() => new Engine('coucou: 0'))

// Basic usage
router.use(apiRoutes)

// Use with specific route prefix
router.use('/v1', apiRoutes)

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3003)
