import Router from '@koa/router'
import koaBody from 'koa-body'
import OAPIValidator from 'openapi-validator-middleware'
import * as routes from '../routes'
import { Expressions, NewEngine, Situation } from '../types'

const InputValidationError = OAPIValidator.InputValidationError

const applyKoaBodyIfNotPresent: Router.Middleware<{}, {}> = (ctx, next) => {
	if (typeof ctx.request.body === 'undefined') {
		return koaBody({})(ctx, next)
	} else {
		return next()
	}
}

interface EvaluateBody {
	expressions: Expressions
	situation?: Situation
}

export default function publicodesAPI(newEngine: NewEngine) {
	const router = new Router()

	const OAPIValidatorMiddleware = OAPIValidator.getNewMiddleware(
		'./source/openapi.yaml',
		{ framework: 'koa' }
	)

	router
		.use(async (ctx, next) => {
			try {
				return await next()
			} catch (err) {
				if (!(err instanceof InputValidationError)) {
					throw err
				}
				ctx.status = 400
				ctx.body = err.errors
			}
		})
		.post(
			'/evaluate',
			applyKoaBodyIfNotPresent,
			OAPIValidatorMiddleware.validate,
			async (ctx) => {
				const { situation, expressions } = ctx.request.body as EvaluateBody

				console.log(ctx.request.body, situation, expressions)

				if (expressions) {
					const evaluateResult = routes.evaluate(newEngine, {
						expressions,
						situation,
					})

					ctx.type = 'application/json'
					ctx.body = evaluateResult
				}
			}
		)
		.get('/rules', OAPIValidatorMiddleware.validate, (ctx) => {
			ctx.type = 'application/json'
			ctx.body = routes.rules(newEngine)
		})
		.get('/rules/:rule', OAPIValidatorMiddleware.validate, (ctx) => {
			const { rule } = ctx.params

			ctx.type = 'application/json'
			ctx.body = routes.rulesId(newEngine, rule)
		})

	return router.routes()
}
