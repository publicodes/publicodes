import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { rules, rulesId } from '../rules'

const newEngine = () => new Engine('rules: 42')

describe('evaluate', () => {
	it('Should list rules', () => {
		expect(rules(newEngine)).toMatchInlineSnapshot(`
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
		expect(rulesId(newEngine, 'rules')).toMatchInlineSnapshot(`
			{
			  "nodeKind": "rule",
			  "rawNode": {
			    "formule": "42",
			    "nom": "rules",
			  },
			  "suggestions": {},
			  "title": "Rules",
			}
		`)
	})

	it('Should return an error', () => {
		expect(rulesId(newEngine, 'bad rules')).toMatchInlineSnapshot(`
			{
			  "error": {
			    "message": "La règle 'bad rules' n'existe pas",
			  },
			}
		`)
	})
})
