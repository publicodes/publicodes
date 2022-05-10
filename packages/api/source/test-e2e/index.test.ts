import Router from '@koa/router'
import chaiHttp from 'chai-http'
import Koa from 'koa'
import Engine from 'publicodes'
import { beforeAll, chai, describe, expect, it } from 'vitest'
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

describe('e2e koa middleware', () => {
	it('Test evaluate endpoint', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({ expressions: '1 + 1' })
				.then((res) => JSON.parse(res.text))
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
				.then((res) => JSON.parse(res.text))
		).resolves.toMatchSnapshot()
	})

	it('Test evaluate endpoint with null expression', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({ expressions: null })
				.then((res) => JSON.parse(res.text))
		).resolves.toMatchSnapshot()
	})
	
	it('Test evaluate endpoint with empty expression', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({ expressions: [] })
				.then((res) => JSON.parse(res.text))
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
				.then((res) => JSON.parse(res.text))
		).resolves.toMatchInlineSnapshot(`
			{
			  "evaluate": [
			    {
			      "missingVariables": [],
			      "nodeValue": false,
			      "traversedVariables": [
			        "coucou",
			      ],
			    },
			  ],
			  "situationError": {
			    "message": "
			[ Erreur syntaxique ]
			➡️  Dans la règle \\"situation [0]\\"
			✖️  La référence 'c' est introuvable.
				Vérifiez que l'orthographe et l'espace de nom sont corrects
			    
			",
			  },
			}
		`)
	})

	it('Test evaluate endpoint with situation', async () => {
		await expect(
			chai
				.request(server)
				.post('/evaluate')
				.send({
					expressions: ['coucou = 2 * 21'],
					situation: { coucou: 42 },
				})
				.then((res) => JSON.parse(res.text))
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
				.then((res) => JSON.parse(res.text))
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
				.then((res) => JSON.parse(res.text))
		).resolves.toMatchInlineSnapshot(`
			{
			  "nodeKind": "rule",
			  "rawNode": {
			    "formule": "0",
			    "nom": "coucou",
			  },
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
				.then((res) => JSON.parse(res.text))
		).resolves.toMatchInlineSnapshot(`
			{
			  "error": {
			    "message": "La règle 'bad rule' n'existe pas",
			  },
			}
		`)
	})
})
