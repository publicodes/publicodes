import { expect } from 'chai'
import Engine, { parseExpression } from '../source/index'

describe("Enable external codebases to use publicodes's expression parser", () => {
	it('parse expressions', () => {
		const parsed = parseExpression('équipement * facteur')
		expect(JSON.stringify(parsed)).to.equal(
			JSON.stringify({
				'*': [
					{
						variable: 'équipement',
					},
					{
						variable: 'facteur',
					},
				],
			})
		)
	})
})
