import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { rules, rulesId } from '../rules'

const newEngine = () => new Engine('rules: 42')

describe('evaluate', () => {
	it('Should list rules', () => {
		expect(rules(newEngine)).toMatchSnapshot()
	})

	it('Should return rules data', () => {
		expect(rulesId(newEngine, 'rules')).toMatchSnapshot()
	})

	it('Should return an error', () => {
		expect(rulesId(newEngine, 'bad rules')).toMatchSnapshot()
	})
})
