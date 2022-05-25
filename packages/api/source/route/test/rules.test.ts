import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { rules, rulesId } from '../rules'

const engine = new Engine('rules: 42')

describe('evaluate', () => {
	it('Should list rules', () => {
		expect(rules(engine)).toMatchInlineSnapshot(`
			{
			  "rules": {
			    "nodeKind": "rule",
			    "rawNode": {
			      "formule": "42",
			      "nom": "rules",
			    },
			    "replacements": [],
			    "suggestions": {},
			    "title": "Rules",
			  },
			}
		`)
	})

	it('Should return rules data', () => {
		expect(rulesId(engine, 'rules')).toMatchInlineSnapshot(`
			{
			  "nodeKind": "rule",
			  "rawNode": {
			    "formule": "42",
			    "nom": "rules",
			  },
			  "replacements": [],
			  "suggestions": {},
			  "title": "Rules",
			}
		`)
	})

	it('Should return an error', () => {
		expect(rulesId(engine, 'bad rules')).toMatchInlineSnapshot(`
			{
			  "error": {
			    "message": "La règle 'bad rules' n'existe pas",
			  },
			}
		`)
	})
})
