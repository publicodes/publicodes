import Router from '@koa/router'
import { Context, Next } from 'koa'
import koaBody from 'koa-body'
import OAPIValidator from 'openapi-validator-middleware'
import { openapiPath } from '../index'
import * as routes from '../routes'
import { Expressions, NewEngine, Situation } from '../types'

const InputValidationError = OAPIValidator.InputValidationError

const applyKoaBodyIfNotPresent: Router.Middleware<{}, {}> = (
	ctx: Context,
	next: Next
) => {
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

	const OAPIValidatorMiddleware = OAPIValidator.getNewMiddleware(openapiPath, {
		framework: 'koa',
	})

	router
		.use(async (ctx: Context, next: Next) => {
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
			async (ctx: Context) => {
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
		.get('/rules', OAPIValidatorMiddleware.validate, (ctx: Context) => {
			ctx.type = 'application/json'
			ctx.body = routes.rules(newEngine)
		})
		.get('/rules/:rule', OAPIValidatorMiddleware.validate, (ctx: Context) => {
			const { rule } = ctx.params

			ctx.type = 'application/json'
			ctx.body = routes.rulesId(newEngine, rule)
		})

	return router.routes()
}
