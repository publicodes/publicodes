import { expect } from 'chai'
import Engine from '../source/index'

describe('Applicability evaluation', function () {
	it('identify non applicable rule', function () {
		const engine = new Engine({
			example: {
				'applicable si': 'x',
				valeur: '2€',
			},
			x: 'non',
		})

		expect(engine.evaluateApplicability('example').isApplicable).to.be.false
	})
})
