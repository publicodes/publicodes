import Router from '@koa/router'
import koaBody from 'koa-body'
import { PublicodesExpression } from 'publicodes'
import * as routes from './routes'
import { NewEngine } from './types'

interface RawBody {
	expressions?: PublicodesExpression | PublicodesExpression[]
	situation?: Record<string, unknown>
}

interface ParsedBody {
	expressions?: PublicodesExpression | PublicodesExpression[]
	situation?: Partial<Record<string, PublicodesExpression>>
}

const applyKoaBodyIfNotPresent: Router.Middleware<{}, {}> = (ctx, next) => {
	if (typeof ctx.request.body === 'undefined') {
		return koaBody({})(ctx, next)
	} else {
		return next()
	}
}

// TODO: Parser
const parseEvaluateBody = (rawBody: RawBody): ParsedBody =>
	rawBody as ParsedBody

export default function publicodesAPI(newEngine: NewEngine) {
	const router = new Router()

	router
		.post('/evaluate', applyKoaBodyIfNotPresent, (ctx) => {
			// Parse
			const { situation, expressions } = parseEvaluateBody(ctx.request.body)

			console.log(situation, expressions)

			// TODO: Validate

			// Evaluate
			if (expressions) {
				const evaluateResult = routes.evaluate(newEngine, expressions, {
					situation,
				})

				ctx.type = 'application/json'
				ctx.body = evaluateResult
			}
		})
		.get('/rules', (ctx) => {
			ctx.type = 'application/json'
			ctx.body = routes.rules(newEngine)
		})
		.get('/rules/:id', (ctx) => {
			const { id } = ctx.params

			ctx.type = 'application/json'
			ctx.body = routes.rulesId(newEngine, id)
		})

	return router.routes()
}
