import Engine from 'publicodes'
import { describe, expect, it, vi } from 'vitest'
import { Expressions, Situation } from '../../types'
import { evaluate } from '../evaluate'

const obj = {
	setSituation: (_situation?: Situation) => 42,
	evaluate: (_expressions: Expressions) => ({
		nodeValue: 42,
		unit: 42,
		traversedVariables: 42,
		missingVariables: 42,
	}),
	shallowCopy: () => obj,
}

const mockedEngine = obj as unknown as Engine

const rules = `
prix:
prix . carottes: 2€/kg
prix . champignons: 5€/kg
prix . avocat: 2€/avocat

dépenses primeur:
  formule:
    somme:
      - prix . carottes * 1.5 kg
      - prix . champignons * 500g
      - prix . avocat * 3 avocat
`

const engine = new Engine(rules)

describe('evaluate', () => {
	it('Test input/output', () => {
		const spySitu = vi.spyOn(obj, 'setSituation')
		const spyEval = vi.spyOn(obj, 'evaluate')

		expect(
			evaluate(mockedEngine, {
				expressions: 'expressions',
				situation: { test: 'test' },
			})
		).toMatchInlineSnapshot(`
			{
			  "evaluate": [
			    {
			      "missingVariables": 42,
			      "nodeValue": 42,
			      "traversedVariables": 42,
			      "unit": 42,
			    },
			  ],
			  "situationError": null,
			}
		`)

		expect(spySitu).toHaveBeenCalledWith({ test: 'test' })
		expect(spyEval).toHaveBeenCalledWith('expressions')
	})

	it('One expression in array should return same result as a single same expression', () => {
		expect(evaluate(mockedEngine, { expressions: ['coucou'] })).toMatchObject(
			evaluate(mockedEngine, { expressions: 'coucou' })
		)
	})

	it('Simple test with real Engine', () => {
		expect(evaluate(engine, { expressions: ['21 + 21', '6 * 7'] }))
			.toMatchInlineSnapshot(`
				{
				  "evaluate": [
				    {
				      "missingVariables": {},
				      "nodeValue": 42,
				      "traversedVariables": [],
				      "unit": undefined,
				    },
				    {
				      "missingVariables": {},
				      "nodeValue": 42,
				      "traversedVariables": [],
				      "unit": undefined,
				    },
				  ],
				  "situationError": null,
				}
			`)
	})

	it('Test with real Engine', () => {
		expect(
			evaluate(engine, {
				expressions: ['dépenses primeur', 'prix', 'prix . avocat * 21'],
			})
		).toMatchInlineSnapshot(`
			{
			  "evaluate": [
			    {
			      "missingVariables": {},
			      "nodeValue": 11.5,
			      "traversedVariables": [
			        "dépenses primeur",
			        "prix . carottes",
			        "prix . champignons",
			        "prix . avocat",
			      ],
			      "unit": {
			        "denominators": [],
			        "numerators": [
			          "€",
			        ],
			      },
			    },
			    {
			      "missingVariables": {
			        "prix": 1,
			      },
			      "nodeValue": undefined,
			      "traversedVariables": [
			        "prix",
			      ],
			      "unit": undefined,
			    },
			    {
			      "missingVariables": {},
			      "nodeValue": 42,
			      "traversedVariables": [
			        "prix . avocat",
			      ],
			      "unit": {
			        "denominators": [
			          "avocat",
			        ],
			        "numerators": [
			          "€",
			        ],
			      },
			    },
			  ],
			  "situationError": null,
			}
		`)
	})

	it('Test invalid syntax in situation', () => {
		expect(
			evaluate(engine, {
				expressions: ['1 + 1'],
				situation: { test: '"42' },
			})
		).toMatchSnapshot()
	})

	it('Test syntax error in expression', () => {
		expect(evaluate(engine, { expressions: '1+1' })).toMatchSnapshot()
	})

	it('Test two syntax error in expression', () => {
		expect(
			evaluate(engine, {
				expressions: ['1+1', '"42', '42'],
			})
		).toMatchSnapshot()
	})

	it('Test error in expression and situation at same time', () => {
		expect(
			evaluate(engine, { expressions: '1+1', situation: { test: '"42' } })
		).toMatchSnapshot()
	})

	it('Test no expressions', () => {
		expect(evaluate(engine, { expressions: [] })).toMatchInlineSnapshot(`
			{
			  "evaluate": [],
			  "situationError": null,
			}
		`)
	})
})
