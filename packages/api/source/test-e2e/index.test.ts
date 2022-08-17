import Router from '@koa/router'
import chaiHttp from 'chai-http'
import Koa from 'koa'
import Engine from 'publicodes'
import { afterAll, beforeAll, chai, describe, expect, it } from 'vitest'
import publicodesAPI from '../middleware/koa'
import { parse } from 'yaml'

interface State extends Koa.DefaultState {}

interface Context extends Koa.DefaultContext {}

const app = new Koa<State, Context>()
const router = new Router<State, Context>()

const apiRoutes = publicodesAPI(
	new Engine(
		parse(`
coucou: 0
coucou . j'ai des caractères spéciaux: "'ok'"
`)
	)
)

router.use(apiRoutes)

app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(3003)

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
			      "missingVariables": {},
			      "nodeValue": 2,
			      "traversedVariables": [],
			    },
			  ],
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
			      "missingVariables": {},
			      "nodeValue": true,
			      "traversedVariables": [
			        "coucou",
			      ],
			    },
			  ],
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
			      "nom": "coucou",
			      "valeur": "0",
			    },
			    "replacements": [],
			    "suggestions": {},
			    "title": "Coucou",
			  },
			  "coucou . j'ai des caractères spéciaux": {
			    "nodeKind": "rule",
			    "rawNode": {
			      "nom": "coucou . j'ai des caractères spéciaux",
			      "valeur": "'ok'",
			    },
			    "replacements": [],
			    "suggestions": {},
			    "title": "J'ai des caractères spéciaux",
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
			    "nom": "coucou",
			    "valeur": "0",
			  },
			  "replacements": [],
			  "suggestions": {},
			  "title": "Coucou",
			}
		`)
	})

	it('Test rules/:id endpoint with special characters', async () => {
		await expect(
			chai
				.request(server)
				.get("/rules/coucou . j'ai des caractères spéciaux")
				.then(async (res) => {
					expect(res.status).toMatchInlineSnapshot('200')

					return JSON.parse(res.text)
				})
		).resolves.toMatchInlineSnapshot(`
			{
			  "nodeKind": "rule",
			  "rawNode": {
			    "nom": "coucou . j'ai des caractères spéciaux",
			    "valeur": "'ok'",
			  },
			  "replacements": [],
			  "suggestions": {},
			  "title": "J'ai des caractères spéciaux",
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
})
