import Engine from 'publicodes'
import { describe, expect, it } from 'bun:test'
import { rules, rulesId } from '../rules.js'

const engine = new Engine({ rules: 42 })

describe('evaluate', () => {
	it('Should list rules', () => {
		expect(rules(engine)).toMatchInlineSnapshot(`
			{
			  "rules": {
			    "nodeKind": "rule",
			    "rawNode": {
			      "valeur": "42",
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
			    "valeur": "42",
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
			    "message": "
			[ Règle inconnue ]
			➡️  Dans la règle \\"bad rules\\"
			⚠️  La règle 'bad rules' n'existe pas",
			  },
			}
		`)
	})
})
