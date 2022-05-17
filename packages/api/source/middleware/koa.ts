import Router from '@koa/router'
import { Context, Next } from 'koa'
import koaBody from 'koa-body'
import OAPIValidator from 'openapi-validator-middleware'
import { openapiPath } from '../index.js'
import * as routes from '../route/index.js'
import { Expressions, NewEngine, Situation } from '../types.js'

const InputValidationError = OAPIValidator.InputValidationError

type koaValidate = (ctx: Record<string, any>, next: Function) => Promise<void> // koa

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

	// The validator uses the original openapi.json, not the custom one
	const OAPIValidatorMiddleware = OAPIValidator.getNewMiddleware(openapiPath, {
		framework: 'koa',
	})

	/**
	 * This middleware wrap OAPIValidatorMiddleware.validate method
	 * to remove prefix in url if there is one in _matchedRoute.
	 * @param route The OAPI route
	 * @returns
	 */
	const validateInput =
		(route: string | ((ctx: Context) => string)) =>
		async (ctx: Context, next: Next) => {
			const backupMatchedRoute = ctx._matchedRoute

			ctx._matchedRoute = typeof route === 'string' ? route : route(ctx)
			await (OAPIValidatorMiddleware.validate as koaValidate)(ctx, () => {})
			ctx._matchedRoute = backupMatchedRoute

			return await next()
		}

	router
		.use(async (ctx: Context, next: Next) => {
			try {
				const ret = await next()

				return ret
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
			validateInput('/evaluate'),
			async (ctx: Context) => {
				const { situation, expressions } = ctx.request.body as EvaluateBody

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
		.get('/rules', validateInput('/rules'), (ctx: Context) => {
			ctx.type = 'application/json'
			ctx.body = routes.rules(newEngine)
		})
		.get(
			'/rules/:rule',
			validateInput((ctx) => `/rules/${ctx.params.rule}`),
			(ctx: Context) => {
				const { rule } = ctx.params

				ctx.type = 'application/json'
				ctx.body = routes.rulesId(newEngine, rule)
			}
		)

	const routesMiddleware = router.routes()

	return routesMiddleware
}