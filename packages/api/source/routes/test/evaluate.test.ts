import { Expressions, NewEngine, Situation } from '@/types'
import Engine from 'publicodes'
import { describe, expect, it, vi } from 'vitest'
import { evaluate } from '../evaluate'

const obj = {
	setSituation: (situation?: Situation) => 42,
	evaluate: (expressions: Expressions) => ({
		nodeValue: 42,
		unit: 42,
		traversedVariables: 42,
		missingVariables: 42,
	}),
}

const mockedNewEngine = ((expressions: Expressions, situation?: Situation) =>
	obj) as unknown as NewEngine

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

const newEngine = () => new Engine(rules)

describe('evaluate', () => {
	it('Test input/output', () => {
		const spySitu = vi.spyOn(obj, 'setSituation')
		const spyEval = vi.spyOn(obj, 'evaluate')

		expect(
			evaluate(mockedNewEngine, 'expressions', { situation: { test: 'test' } })
		).toMatchSnapshot()

		expect(spySitu).toHaveBeenCalledWith({ test: 'test' })
		expect(spyEval).toHaveBeenCalledWith('expressions')
	})

	it('One expression in array should return same result as a single same expression', () => {
		expect(evaluate(mockedNewEngine, ['coucou'])).toMatchObject(
			evaluate(mockedNewEngine, 'coucou')
		)
	})

	it('Simple test with real Engine', () => {
		expect(evaluate(newEngine, ['21 + 21', '6 * 7'], {})).toMatchSnapshot()
	})

	it('Test with real Engine', () => {
		expect(
			evaluate(
				newEngine,
				['dépenses primeur', 'prix', 'prix . avocat * 21'],
				{}
			)
		).toMatchSnapshot()
	})

	it('Test invalid syntax in situation', () => {
		expect(
			evaluate(newEngine, ['1 + 1'], {
				situation: { test: '"42"' },
			})
		).toMatchSnapshot()
	})

	it('Test syntax error in expression', () => {
		expect(evaluate(newEngine, '1+1')).toMatchSnapshot()
	})

	it('Test two syntax error in expression', () => {
		expect(evaluate(newEngine, ['1+1', '"42"', '42'])).toMatchSnapshot()
	})

	it('Test error in expression and situation at same time', () => {
		expect(
			evaluate(newEngine, '1+1', { situation: { test: '"42"' } })
		).toMatchSnapshot()
	})

	it('Test no expressions', () => {
		expect(evaluate(newEngine, [])).toMatchSnapshot()
	})
})
