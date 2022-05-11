import cors from '@koa/cors'
import Router from '@koa/router'
import Koa from 'koa'
import Engine from 'publicodes'
import { koaMiddleware as publicodesAPI } from 'publicodes-api'

interface State extends Koa.DefaultState {}

interface Context extends Koa.DefaultContext {}

const app = new Koa<State, Context>()
const router = new Router<State, Context>()

app.use(cors())

// Create middleware with your Engine
const apiRoutes = publicodesAPI(() => new Engine(`coucou: 0`))

// Basic routes usage (/evaluate, /rules, etc.)
router.use(apiRoutes)

// Or use with specific route prefix (/v1/evaluate, /v1/rules, etc.)
router.use('/v1', apiRoutes)

app.use(router.routes())
app.use(router.allowedMethods())

const port = 3003

app.listen(port, function () {
	console.log('listening on port:', port)
})
