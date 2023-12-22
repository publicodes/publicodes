import Router from '@koa/router'
import { IncomingMessage } from 'http'
import { Next, ParameterizedContext } from 'koa'
import koaBody from 'koa-body'
import OAPIValidator from 'openapi-validator-middleware'
import { openapiPath } from '../index.js'
import * as routes from '../route/index.js'
import { Engine, Expressions, Situation } from '../types.js'

const InputValidationError = OAPIValidator.InputValidationError

type koaValidate = (ctx: Record<string, any>, next: Function) => Promise<void> // koa

/**
 * This middleware detects if koa-body has already been applied by the user because
 * koa-body throws an InternalServerError if we apply it multiple times.
 */
const applyKoaBodyIfNotPresent: Router.Middleware<{}, {}> = (
	ctx: Context,
	next: Next,
) => {
	if (typeof ctx.request.body === 'undefined') {
		return koaBody()(ctx, next)
	} else {
		return next()
	}
}

interface EvaluateBody {
	expressions: Expressions
	situation?: Situation
}

interface CustomIncomingMessage extends IncomingMessage {
	body?: unknown
}

interface Context extends ParameterizedContext {
	req: CustomIncomingMessage
}

export default function publicodesAPI(engine: Engine) {
	const router = new Router()

	// The validator uses the original openapi.json, not the custom one
	const OAPIValidatorMiddleware = OAPIValidator.getNewMiddleware(openapiPath, {
		framework: 'koa',
	})

	/**
	 * This middleware wrap OAPIValidatorMiddleware.validate method
	 * to remove prefix in url if there is one in _matchedRoute,
	 * and replace ctx.req.body by ctx.request.body if it's an instance of Buffer.
	 * @param route The OAPI route
	 * @returns
	 */
	const validateInput =
		(route: string | ((ctx: Context) => string)) =>
		async (ctx: Context, next: Next) => {
			const backupMatchedRoute = ctx._matchedRoute
			const backupReqBody = ctx.req.body

			if (ctx.req.body instanceof Buffer) {
				ctx.req.body = ctx.request.body
			}

			ctx._matchedRoute = typeof route === 'string' ? route : route(ctx)
			await (OAPIValidatorMiddleware.validate as koaValidate)(ctx, () => {})
			ctx._matchedRoute = backupMatchedRoute
			ctx.req.body = backupReqBody
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
					const evaluateResult = routes.evaluate(engine, {
						expressions,
						situation,
					})

					ctx.type = 'application/json'
					ctx.body = evaluateResult
				}
			},
		)
		.get('/rules', validateInput('/rules'), (ctx: Context) => {
			ctx.type = 'application/json'
			ctx.body = routes.rules(engine)
		})
		.get(
			'/rules/:rule',
			validateInput((ctx) => `/rules/${ctx.params.rule}`),
			(ctx: Context) => {
				const { rule } = ctx.params

				ctx.type = 'application/json'
				ctx.body = routes.rulesId(engine, rule)
			},
		)

	const routesMiddleware = router.routes()

	return routesMiddleware
}
