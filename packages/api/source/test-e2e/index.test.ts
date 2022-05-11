import Router from '@koa/router'
import chaiHttp from 'chai-http'
import Koa from 'koa'
import Engine from 'publicodes'
import { afterAll, beforeAll, chai, describe, expect, it } from 'vitest'
import publicodesAPI from '../middleware/koa'

interface State extends Koa.DefaultState {}

interface Context extends Koa.DefaultContext {}

const app = new Koa<State, Context>()
const router = new Router<State, Context>()

const apiRoutes = publicodesAPI(() => new Engine('coucou: 0'))

router.use(apiRoutes)

app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(3004)

chai.use(chaiHttp)

beforeAll(async () => {
	await new Promise((res, _rej) => {
		server.once('listening', () => res(null))
	})
})

afterAll(async () => {
	server.close()
})

describe('e2e koa middleware', () => {
	it('Test evaluate endpoint', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({ expressions: '1 + 1' })

				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('200')

					return JSON.parse(res.text)
				})
		).resolves.toMatchInlineSnapshot(
			`
			{
			  "evaluate": [
			    {
			      "missingVariables": [],
			      "nodeValue": 2,
			      "traversedVariables": [],
			    },
			  ],
			  "situationError": null,
			}
		`
		)
	})

	it('Test evaluate endpoint with bad expression', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({ expressions: '1+1' })

				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('200')

					return JSON.parse(res.text)
				})
		).resolves.toMatchSnapshot()
	})

	it('Test evaluate endpoint with null expression', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({ expressions: null })

				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('400')

					return JSON.parse(res.text)
				})
		).resolves.toMatchSnapshot()
	})

	it('Test evaluate endpoint with empty expression', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({ expressions: [] })

				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('400')

					return JSON.parse(res.text)
				})
		).resolves.toMatchSnapshot()
	})

	it('Test evaluate endpoint with bad situation', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({
					expressions: ['coucou = 2 * 21'],
					situation: 'coucou: 42',
				})

				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('400')

					return JSON.parse(res.text)
				})
		).resolves.toMatchInlineSnapshot(`
			[
			  {
			    "dataPath": ".situation",
			    "keyword": "type",
			    "message": "should be object",
			    "params": {
			      "type": "object",
			    },
			    "schemaPath": "#/properties/situation/type",
			  },
			]
		`)
	})

	it('Test evaluate endpoint with situation', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({
					expressions: ['coucou = 2 * 21'],
					situation: { coucou: '42' },
				})
				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('200')

					return JSON.parse(res.text)
				})
		).resolves.toMatchInlineSnapshot(`
			{
			  "evaluate": [
			    {
			      "missingVariables": [],
			      "nodeValue": true,
			      "traversedVariables": [
			        "coucou",
			      ],
			    },
			  ],
			  "situationError": null,
			}
		`)
	})

	it('Test rules endpoint', async () => {
		await expect(
			chai
				.request(server)
				.get('/rules')

				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('200')

					return JSON.parse(res.text)
				})
		).resolves.toMatchInlineSnapshot(`
			{
			  "coucou": {
			    "nodeKind": "rule",
			    "rawNode": {
			      "formule": "0",
			      "nom": "coucou",
			    },
			    "replacements": [],
			    "suggestions": {},
			    "title": "Coucou",
			  },
			}
		`)
	})

	it('Test rules/:id endpoint', async () => {
		await expect(
			chai
				.request(server)
				.get('/rules/coucou')

				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('200')

					return JSON.parse(res.text)
				})
		).resolves.toMatchInlineSnapshot(`
			{
			  "nodeKind": "rule",
			  "rawNode": {
			    "formule": "0",
			    "nom": "coucou",
			  },
			  "replacements": [],
			  "suggestions": {},
			  "title": "Coucou",
			}
		`)
	})

	it('Test bad rules/:id endpoint', async () => {
		await expect(
			chai
				.request(server)
				.get('/rules/bad rule')

				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('200')

					return JSON.parse(res.text)
				})
		).resolves.toMatchInlineSnapshot(`
			{
			  "error": {
			    "message": "La règle 'bad rule' n'existe pas",
			  },
			}
		`)
	})

	it('Test doc endpoint', async () => {
		await expect(
			chai
				.request(server)
				.get('/doc/')
				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('200')

					return { text: res.text }
				})
		).resolves.toMatchInlineSnapshot(`
			{
			  "text": "<!-- HTML for static distribution bundle build -->
			<!DOCTYPE html>
			<html lang=\\"en\\">
			  <head>
			    <meta charset=\\"UTF-8\\">
			    <title>Swagger UI</title>
			    <link rel=\\"stylesheet\\" type=\\"text/css\\" href=\\"./swagger-ui.css\\" />
			    <link rel=\\"stylesheet\\" type=\\"text/css\\" href=\\"index.css\\" />
			    <link rel=\\"icon\\" type=\\"image/png\\" href=\\"./favicon-32x32.png\\" sizes=\\"32x32\\" />
			    <link rel=\\"icon\\" type=\\"image/png\\" href=\\"./favicon-16x16.png\\" sizes=\\"16x16\\" />
			  </head>
			
			  <body>
			    <div id=\\"swagger-ui\\"></div>
			    <script src=\\"./swagger-ui-bundle.js\\" charset=\\"UTF-8\\"> </script>
			    <script src=\\"./swagger-ui-standalone-preset.js\\" charset=\\"UTF-8\\"> </script>
			    <script src=\\"./swagger-initializer.js\\" charset=\\"UTF-8\\"> </script>
			  </body>
			</html>
			",
			}
		`)
	})
})
